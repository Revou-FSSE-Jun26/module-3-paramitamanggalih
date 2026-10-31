from app import create_app, db
from app.models import User, Category, Product, Order, OrderItem

app = create_app()

with app.app_context():
    db.create_all()
    print("Semua tabel berhasil dibuat!")
