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


# =========================
# CREATE CATEGORY
# =========================

def test_create_category(client):
    category_name = unique_name("Test Category")

    response = client.post(
        "/categories",
        json={"name": category_name}
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["name"] == category_name
    assert "id" in data


def test_create_category_without_name(client):
    response = client.post(
        "/categories",
        json={"description": "No name"}
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["message"] == "name is required"


def test_create_category_empty_name(client):
    response = client.post(
        "/categories",
        json={"name": ""}
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["message"] == "Name must be a non-empty string"


def test_create_duplicate_category(client):
    category_name = unique_name("Duplicate Category")

    first_response = client.post(
        "/categories",
        json={"name": category_name}
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/categories",
        json={"name": category_name}
    )

    assert second_response.status_code == 409

    data = second_response.get_json()

    assert data["message"] == "Category already exists"


# =========================
# GET CATEGORIES
# =========================

def test_get_categories(client):
    response = client.get("/categories")

    assert response.status_code == 200

    data = response.get_json()

    assert isinstance(data, list)


def test_get_category(client):
    category_name = unique_name("Category For Get")

    create_response = client.post(
        "/categories",
        json={"name": category_name}
    )

    assert create_response.status_code == 201

    category_id = create_response.get_json()["id"]

    response = client.get(
        f"/categories/{category_id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == category_id
    assert data["name"] == category_name
    assert "products" in data


def test_get_category_not_found(client):
    response = client.get("/categories/99999")

    assert response.status_code == 404

    data = response.get_json()

    assert data["message"] == "Category not found"


# =========================
# UPDATE CATEGORY
# =========================

def test_update_category(client):
    original_name = unique_name("Category To Update")
    updated_name = unique_name("Updated Category")

    create_response = client.post(
        "/categories",
        json={"name": original_name}
    )

    assert create_response.status_code == 201

    category_id = create_response.get_json()["id"]

    response = client.put(
        f"/categories/{category_id}",
        json={"name": updated_name}
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == category_id
    assert data["name"] == updated_name


def test_update_category_not_found(client):
    response = client.put(
        "/categories/99999",
        json={"name": unique_name("Updated Category")}
    )

    assert response.status_code == 404

    data = response.get_json()

    assert data["message"] == "Category not found"


def test_update_category_without_name(client):
    category_name = unique_name("Category Without Update Name")

    create_response = client.post(
        "/categories",
        json={"name": category_name}
    )

    assert create_response.status_code == 201

    category_id = create_response.get_json()["id"]

    response = client.put(
        f"/categories/{category_id}",
        json={"description": "No name"}
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["message"] == "name is required"


def test_update_category_empty_name(client):
    category_name = unique_name("Category Empty Update")

    create_response = client.post(
        "/categories",
        json={"name": category_name}
    )

    assert create_response.status_code == 201

    category_id = create_response.get_json()["id"]

    response = client.put(
        f"/categories/{category_id}",
        json={"name": ""}
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["message"] == "Name must be a non-empty string"


def test_update_category_duplicate_name(client):
    first_name = unique_name("First Category")
    second_name = unique_name("Second Category")

    first_response = client.post(
        "/categories",
        json={"name": first_name}
    )

    second_response = client.post(
        "/categories",
        json={"name": second_name}
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 201

    first_id = first_response.get_json()["id"]

    response = client.put(
        f"/categories/{first_id}",
        json={"name": second_name}
    )

    assert response.status_code == 409

    data = response.get_json()

    assert data["message"] == "Category already exists"


# =========================
# DELETE CATEGORY
# =========================

def test_delete_category(client):
    category_name = unique_name("Category To Delete")

    create_response = client.post(
        "/categories",
        json={"name": category_name}
    )

    assert create_response.status_code == 201

    category_id = create_response.get_json()["id"]

    response = client.delete(
        f"/categories/{category_id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["message"] == "Category deleted successfully"

    get_response = client.get(
        f"/categories/{category_id}"
    )

    assert get_response.status_code == 404


def test_delete_category_not_found(client):
    response = client.delete("/categories/99999")

    assert response.status_code == 404

    data = response.get_json()

    assert data["message"] == "Category not found"


def test_delete_category_with_products(client):
    category_response = client.post(
        "/categories",
        json={"name": unique_name("Category with Products")}
    )

    assert category_response.status_code == 201
    category_id = category_response.get_json()["id"]

    product_response = client.post(
        "/products",
        json={
            "name": unique_name("Product in Category"),
            "description": "Product for category deletion test",
            "price": 100000,
            "stock": 5,
            "category_id": category_id
        }
    )

    assert product_response.status_code == 201

    response = client.delete(f"/categories/{category_id}")

    assert response.status_code == 409

    data = response.get_json()

    assert data["message"] == (
        "Category cannot be deleted because it has products"
    )
