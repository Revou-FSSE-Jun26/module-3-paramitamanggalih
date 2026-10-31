import uuid

import pytest

from app import create_app, db


@pytest.fixture
def client():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite://",
    })

    with app.app_context():
        db.create_all()
        try:
            with app.test_client() as client:
                yield client
        finally:
            db.session.remove()
            db.drop_all()


def unique_value(prefix):
    return f"{prefix}_{uuid.uuid4().hex[:8]}"


def create_user(client):
    email = f"{unique_value('order_test')}@example.com"

    response = client.post(
        "/users",
        json={
            "name": "Order Test User",
            "email": email,
            "password": "test123"
        }
    )

    assert response.status_code == 201

    return response.get_json()["id"]


def create_category(client):
    response = client.post(
        "/categories",
        json={"name": unique_value("Order Test Category")}
    )

    assert response.status_code == 201

    return response.get_json()["id"]


def create_product(client, stock=10, price=100000):
    category_id = create_category(client)

    response = client.post(
        "/products",
        json={
            "name": unique_value("Order Test Product"),
            "description": "Product untuk testing order",
            "price": price,
            "stock": stock,
            "category_id": category_id
        }
    )

    assert response.status_code == 201

    return response.get_json()["id"]


def create_order(client, quantity=1, stock=10, price=100000):
    user_id = create_user(client)
    product_id = create_product(
        client,
        stock=stock,
        price=price
    )

    response = client.post(
        "/orders",
        json={
            "user_id": user_id,
            "items": [
                {
                    "product_id": product_id,
                    "quantity": quantity
                }
            ]
        }
    )

    assert response.status_code == 201

    return {
        "order": response.get_json(),
        "user_id": user_id,
        "product_id": product_id
    }


# =========================
# CREATE ORDER
# =========================

def test_create_order(client):
    result = create_order(
        client,
        quantity=2,
        stock=10,
        price=100000
    )

    data = result["order"]

    assert "id" in data
    assert data["user_id"] == result["user_id"]
    assert data["status"] == "pending"
    assert data["total"] == 200000
    assert len(data["items"]) == 1
    assert data["items"][0]["product_id"] == result["product_id"]
    assert data["items"][0]["quantity"] == 2
    assert data["items"][0]["price"] == 100000


def test_create_order_without_user_id(client):
    product_id = create_product(client)

    response = client.post(
        "/orders",
        json={
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 1
                }
            ]
        }
    )

    assert response.status_code == 400


def test_create_order_invalid_user(client):
    product_id = create_product(client)

    response = client.post(
        "/orders",
        json={
            "user_id": 99999,
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 1
                }
            ]
        }
    )

    assert response.status_code == 404


def test_create_order_without_items(client):
    user_id = create_user(client)

    response = client.post(
        "/orders",
        json={
            "user_id": user_id,
            "items": []
        }
    )

    assert response.status_code == 400


def test_create_order_invalid_product(client):
    user_id = create_user(client)

    response = client.post(
        "/orders",
        json={
            "user_id": user_id,
            "items": [
                {
                    "product_id": 99999,
                    "quantity": 1
                }
            ]
        }
    )

    assert response.status_code == 404


def test_create_order_invalid_quantity(client):
    user_id = create_user(client)
    product_id = create_product(client)

    response = client.post(
        "/orders",
        json={
            "user_id": user_id,
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 0
                }
            ]
        }
    )

    assert response.status_code == 400


def test_create_order_insufficient_stock(client):
    user_id = create_user(client)
    product_id = create_product(
        client,
        stock=2,
        price=100000
    )

    response = client.post(
        "/orders",
        json={
            "user_id": user_id,
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 5
                }
            ]
        }
    )

    assert response.status_code == 409
def test_create_order_reduces_stock(client):
    result = create_order(
        client,
        quantity=3,
        stock=10,
        price=100000
    )

    product_id = result["product_id"]

    response = client.get(
        f"/products/{product_id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["stock"] == 7


# =========================
# GET ORDERS
# =========================

def test_get_orders(client):
    create_order(client)

    response = client.get("/orders")

    assert response.status_code == 200

    data = response.get_json()

    assert isinstance(data, list)
    assert len(data) >= 1


def test_get_order(client):
    result = create_order(client)

    order_id = result["order"]["id"]

    response = client.get(
        f"/orders/{order_id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == order_id
    assert data["user_id"] == result["user_id"]
    assert "items" in data
    assert len(data["items"]) == 1


def test_get_order_not_found(client):
    response = client.get("/orders/99999")

    assert response.status_code == 404

    data = response.get_json()

    assert data["message"] == "Order not found"


def test_get_orders_by_user(client):
    result = create_order(client)

    user_id = result["user_id"]

    response = client.get(
        f"/orders?user_id={user_id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert isinstance(data, list)
    assert len(data) >= 1

    for order in data:
        assert order["user_id"] == user_id


# =========================
# UPDATE ORDER
# =========================

def test_update_order_status(client):
    result = create_order(client)

    order_id = result["order"]["id"]

    response = client.put(
        f"/orders/{order_id}",
        json={"status": "processing"}
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == order_id
    assert data["status"] == "processing"


def test_update_order_invalid_status(client):
    result = create_order(client)

    order_id = result["order"]["id"]

    response = client.put(
        f"/orders/{order_id}",
        json={"status": "invalid_status"}
    )

    assert response.status_code == 400


def test_update_order_not_found(client):
    response = client.put(
        "/orders/99999",
        json={"status": "processing"}
    )

    assert response.status_code == 404

    data = response.get_json()

    assert data["message"] == "Order not found"


# =========================
# DELETE ORDER
# =========================

def test_delete_order(client):
    result = create_order(
        client,
        quantity=2,
        stock=10,
        price=100000
    )

    order_id = result["order"]["id"]

    response = client.delete(
        f"/orders/{order_id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["message"] == "Order deleted successfully"

    get_response = client.get(
        f"/orders/{order_id}"
    )

    assert get_response.status_code == 404


def test_delete_order_not_found(client):
    response = client.delete("/orders/99999")

    assert response.status_code == 404

    data = response.get_json()

    assert data["message"] == "Order not found"


def test_delete_order_restores_stock(client):
    result = create_order(
        client,
        quantity=3,
        stock=10,
        price=100000
    )

    order_id = result["order"]["id"]
    product_id = result["product_id"]

    product_response = client.get(
        f"/products/{product_id}"
    )

    assert product_response.status_code == 200
    assert product_response.get_json()["stock"] == 7

    delete_response = client.delete(
        f"/orders/{order_id}"
    )

    assert delete_response.status_code == 200

    product_response = client.get(
        f"/products/{product_id}"
    )

    assert product_response.status_code == 200
    assert product_response.get_json()["stock"] == 10