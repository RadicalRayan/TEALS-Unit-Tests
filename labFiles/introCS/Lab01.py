
import random

def cards():
    number = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    suit = ['Spades', 'Clubs', 'Diamonds', 'Hearts']
    return number[random.randint(0, len(number))] + " " + suit[random.randint(0, len(suit))]

def birthday_song(name):
    return 'happy birthday to you, happy birthday to you, happy birthday dear ' + name + ', happy birthday to you'

def hello_world():
    print('Hello World')