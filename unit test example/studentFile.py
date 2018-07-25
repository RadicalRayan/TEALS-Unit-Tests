
import random

def cards():
    number = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    suit = ['Spades', 'Clubs', 'Diamonds', 'Hearts']
    return number[random.randint(0, len(number))] + " " + suit[random.randint(0, len(suit))]

def birthday_song(name):
    return 'happy birthday to you, happy birthday to you, happy birthday dear ' + name + ', happy birthday to you'

def hello_world():
    print('Hello World')

def magicGenie():
    print("I am a genie. You have three wishes")
    wish1 = input("What would you like to wish for?")
    wish2 = input("What would you like to wish for?")
    wish3 = input("What would you like to wish for?")
    print("Your wishes are " + wish1 + ", " + wish2 + " and " + wish3)
    