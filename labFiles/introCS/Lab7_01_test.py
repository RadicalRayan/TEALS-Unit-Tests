#from __future__ import print_function
import unittest
import contextlib
import sys
import io
import random
import Lab7_01
from unittest.mock import patch


class UnitTests(unittest.TestCase):
    def testColorAverage(self):
        color1 = Lab7_01.Color()
        color1.R, color1.B, color1.G = 0, 0, 0
        
        color2 = Lab7_01.Color()
        color2.R, color2.B, color2.G = 100, 100, 100

        colorAve = Lab7_01.add_color(color1, color2)
        self.assertEqual(colorAve.R, 50)
        self.assertEqual(colorAve.B, 50)
        self.assertEqual(colorAve.G, 50)



if __name__ == '__main__':
    unittest.main() 