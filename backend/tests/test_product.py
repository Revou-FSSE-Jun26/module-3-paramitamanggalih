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


def unique_name(prefix):
    return f"{prefix} {uuid.uuid4().hex[:8]}"


def create_category(client):
    response = client.post(
        "/categories",
        json={"name": unique_name("Product Test Category")}
    )

    assert response.status_code == 201

    return response.get_json()["id"]


# =========================
# CREATE PRODUCT
# =========================

def test_create_product(client):
    category_id = create_category(client)

    product_name = unique_name("Test Product")

    response = client.post(
        "/products",
        json={
            "name": product_name,
            "description": "Product untuk testing",
            "price": 100000,
            "stock": 10,
            "category_id": category_id
        }
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["name"] == product_name
    assert data["description"] == "Product untuk testing"
    assert data["price"] == 100000
    assert data["stock"] == 10
    assert data["category_id"] == category_id
    assert "id" in data


def test_create_product_missing_name(client):
    category_id = create_category(client)

    response = client.post(
        "/products",
        json={
            "price": 100000,
            "stock": 10,
            "category_id": category_id
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["message"] == "name is required"


def test_create_product_empty_name(client):
    category_id = create_category(client)

    response = client.post(
        "/products",
        json={
            "name": "",
            "price": 100000,
            "stock": 10,
            "category_id": category_id
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["message"] == "Name must be a non-empty string"


def test_create_product_negative_price(client):
    category_id = create_category(client)

    response = client.post(
        "/products",
        json={
            "name": unique_name("Negative Price"),
            "price": -100,
            "stock": 10,
            "category_id": category_id
        }
    )

    assert response.status_code == 400


def test_create_product_negative_stock(client):
    category_id = create_category(client)

    response = client.post(
        "/products",
        json={
            "name": unique_name("Negative Stock"),
            "price": 100000,
            "stock": -1,
            "category_id": category_id
        }
    )

    assert response.status_code == 400


def test_create_product_invalid_category(client):
    response = client.post(
        "/products",
        json={
            "name": unique_name("Invalid Category"),
            "price": 100000,
            "stock": 10,
            "category_id": 99999
        }
    )

    assert response.status_code == 404


# =========================
# GET PRODUCTS
# =========================

def test_get_products(client):
    response = client.get("/products")

    assert response.status_code == 200

    data = response.get_json()

    assert isinstance(data, list)


def test_get_product(client):
    category_id = create_category(client)

    product_name = unique_name("Product For Get")

    create_response = client.post(
        "/products",
        json={
            "name": product_name,
            "description": "Get test",
            "price": 150000,
            "stock": 5,
            "category_id": category_id
        }
    )

    assert create_response.status_code == 201

    product_id = create_response.get_json()["id"]

    response = client.get(f"/products/{product_id}")

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == product_id
    assert data["name"] == product_name


def test_get_product_not_found(client):
    response = client.get("/products/99999")

    assert response.status_code == 404

    data = response.get_json()

    assert data["message"] == "Product not found"


# =========================
# UPDATE PRODUCT
# =========================

def test_update_product(client):
    category_id = create_category(client)

    original_name = unique_name("Original Product")
    updated_name = unique_name("Updated Product")

    create_response = client.post(
        "/products",
        json={
            "name": original_name,
            "description": "Original",
            "price": 100000,
            "stock": 10,
            "category_id": category_id
        }
    )

    assert create_response.status_code == 201

    product_id = create_response.get_json()["id"]

    response = client.put(
        f"/products/{product_id}",
        json={
            "name": updated_name,
            "price": 200000,
            "stock": 20
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == product_id
    assert data["name"] == updated_name
    assert data["price"] == 200000
    assert data["stock"] == 20


def test_update_product_not_found(client):
    response = client.put(
        "/products/99999",
        json={"name": unique_name("Updated Product")}
    )

    assert response.status_code == 404

    data = response.get_json()

    assert data["message"] == "Product not found"


def test_update_product_empty_name(client):
    category_id = create_category(client)

    create_response = client.post(
        "/products",
        json={
            "name": unique_name("Product Empty Update"),
            "price": 100000,
            "stock": 10,
            "category_id": category_id
        }
    )

    assert create_response.status_code == 201

    product_id = create_response.get_json()["id"]

    response = client.put(
        f"/products/{product_id}",
        json={"name": ""}
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["message"] == "Name must be a non-empty string"


def test_update_product_negative_price(client):
    category_id = create_category(client)

    create_response = client.post(
        "/products",
        json={
            "name": unique_name("Product Price Update"),
            "price": 100000,
            "stock": 10,
            "category_id": category_id
        }
    )

    assert create_response.status_code == 201

    product_id = create_response.get_json()["id"]

    response = client.put(
        f"/products/{product_id}",
        json={"price": -100}
    )

    assert response.status_code == 400


# =========================
# DELETE PRODUCT
# =========================

def test_delete_product(client):
    category_id = create_category(client)

    create_response = client.post(
        "/products",
        json={
            "name": unique_name("Product To Delete"),
            "price": 100000,
            "stock": 10,
            "category_id": category_id
        }
    )

    assert create_response.status_code == 201

    product_id = create_response.get_json()["id"]

    response = client.delete(f"/products/{product_id}")

    assert response.status_code == 200

    data = response.get_json()

    assert data["message"] == "Product deleted successfully"

    get_response = client.get(f"/products/{product_id}")

    assert get_response.status_code == 404


def test_delete_product_not_found(client):
    response = client.delete("/products/99999")

    assert response.status_code == 404

    data = response.get_json()

    assert data["message"] == "Product not found"