from locust import HttpUser, task, between
from locust.exception import StopUser


class RevoShopUser(HttpUser):
    wait_time = between(1, 3)

    product_id = 66
    user_id = 2
    order_id = None

    @task
    def user_journey(self):

        # 1. GET all products
        with self.client.get(
            "/products",
            name="GET /products",
            catch_response=True
        ) as response:

            if response.status_code != 200:
                response.failure(
                    f"Expected 200, got {response.status_code}"
                )
                raise StopUser

            try:
                products = response.json()
            except Exception:
                response.failure("Invalid JSON response")
                raise StopUser

            if not products:
                response.failure("Product list is empty")
                raise StopUser

        # 2. GET single product
        with self.client.get(
            f"/products/{self.product_id}",
            name="GET /products/<id>",
            catch_response=True
        ) as response:

            if response.status_code != 200:
                response.failure(
                    f"Expected 200, got {response.status_code}"
                )
                raise StopUser

        # 3. POST new order
        order_data = {
            "user_id": self.user_id,
            "items": [
                {
                    "product_id": self.product_id,
                    "quantity": 1
                }
            ]
        }

        with self.client.post(
            "/orders",
            json=order_data,
            name="POST /orders",
            catch_response=True
        ) as response:

            if response.status_code not in [200, 201]:
                response.failure(
                    f"Expected 200/201, got {response.status_code}"
                )
                raise StopUser

            try:
                order = response.json()
            except Exception:
                response.failure("Invalid JSON response")
                raise StopUser

            self.order_id = order.get("id")

            if not self.order_id:
                response.failure("Order ID not found in response")
                raise StopUser

        # 4. GET created order
        with self.client.get(
            f"/orders/{self.order_id}",
            name="GET /orders/<id>",
            catch_response=True
        ) as response:

            if response.status_code != 200:
                response.failure(
                    f"Expected 200, got {response.status_code}"
                )
                raise StopUser

        raise StopUser
