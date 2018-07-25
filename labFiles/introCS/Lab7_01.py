class Color():
    def __init__(self):
        self.R = 0
        self.B = 0
        self.G = 0

def add_color(firstColor, secondColor):
    colorMerged = Color()
    colorMerged.R = (firstColor.R + secondColor.R)/2
    colorMerged.B = (firstColor.B + secondColor.B)/2
    colorMerged.G = (firstColor.G + secondColor.G)/2
    return colorMerged

colorOne = Color()
colorOne.R = 10
colorOne.B = 10
colorOne.G = 10

colorTwo = Color()
colorTwo.R = 50
colorTwo.B = 50
colorTwo.G = 50

colorThree = Color()
colorThree.R = 100
colorThree.B = 100
colorThree.G = 100

#colorAverage = add_color(colorTwo, colorThree)
#print(str(colorAverage.R), str(colorAverage.B), str(colorAverage.G))