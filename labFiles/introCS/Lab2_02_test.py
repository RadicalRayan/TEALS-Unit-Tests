import sys
import io
import lab2_02
import unittest

class UnitTests(unittest.TestCase):
    def test_half_input(self):
        self.assertEqual(lab2_02.half_input(5.5), 5.5/2)

    def test_whole_number(self):
        self.assertEqual(lab2_02.whole_number(5.5), int(5.5/2))

if __name__ == '__main__':
    unittest.main()
