from random import randint

def magic8ball():
  responses = ["Outlook is good", "Ask again later", "Yes", "No", "Most likely no", "Most likely yes", "Maybe", "Outlook is not good"]
  randIndex = randint(0, len(responses) - 1)
  print(responses[randIndex])