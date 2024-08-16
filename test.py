from sqlalchemy import MetaData

from utils import *

metadata = MetaData()
metadata.reflect(bind=engine)
session = Session()

try:
    metadata.drop_all(bind=engine)
    print("All tables dropped successfully.")
except Exception as e:
    print(f"An error occurred: {e}")

with app.app_context():
    db.create_all()
#
# # Register customers and merchants
# customer_register('Tarnished', 'test_name', '111', 'other', 20, '交界地', '起源魔法')
# merchant_register('Fia', '死眠少女菲雅', '111', '前有强敌', '../static/image/merchant/Fia.png', '圆桌厅堂')
administrator_register('Traveler', '111')
carrot = Ingredient(name='carrot')
potato = Ingredient(name='potato')
protein = Nutrition(name='protein')
fat = Nutrition(name='fat')
soybean = Allergen(name='soybean')
dairy_products = Allergen(name='dairy_products')
#
# # Fetch customer and merchant
# customer = session.get(Customer, "Tarnished")
# merchant = session.get(Merchant, "Fia")
#
# # Create objects
# dish = Dish(merchant_account='Fia', name='床帘恩泽', price=0.5, pictures='../static/image/dish/clez.png',
#             description='那份恩泽会让人遗忘所有痛楚——毫无所感的情况，才能死得安祥。')
# dish.nutrition.append(protein)
# dish.ingredients.append(potato)
# dish.allergens.append(soybean)
# # message = Message(text='前有测试，所以接下来信息很有用。')
# # order = Order(status=0, total_price=0.5)
# # comment = Comment(text='前有测试，所以接下来评论很有用。')
# # reserve = Reserve(time='2000-01-01 12:00:00', customer=customer, merchant=merchant)
# # session.add_all([dish, message, order, comment, reserve])
session.add_all([carrot, potato, protein, fat, soybean, dairy_products])
session.commit()

# Associate relationships
# order.merchant.append(merchant)
# order.dishes.append(dish)
# order.customer.append(customer)
# order.messages.append(message)
# comment.sender.append(customer)
# # comment.receiver.append(order)
# # message.sender.append(merchant)
# # message.receiver.append(customer)
# merchant.dishes.append(dish)
#
# # Commit changes and debug output
# session.commit()
#
# # combined_condition = and_(DishInOrder.c.dish_id == dish.dish_id, DishInOrder.c.order_id == order.order_id)
# # update_time = update(DishInOrder).where(combined_condition).values({'number': 4})
# # session.execute(update_time)
# # session.commit()
session.close()
