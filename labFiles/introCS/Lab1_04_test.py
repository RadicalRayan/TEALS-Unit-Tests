from __future__ import print_function
import Lab1_04
import unittest
import sys
import io
import random
from unittest.mock import patch

class UnitTests(unittest.TestCase):
    def setUp(self):
        self.incrementingValue = 0
    
    def side_effect(self, value):
        self.incrementingValue = 1 + self.incrementingValue
        return str(self.incrementingValue)

    # input
    @patch("sys.stdout.write")
    def test_magic_genie_1(self, mock_print):
        with patch('builtins.input', side_effect=self.side_effect):
            Lab1_04.magic_genie() 
        args, kwargs = mock_print.call_args_list[2]
        print(mock_print.call_args)
        mock_print.assert_any_call("Your wishes are 1, 2 and 3")
    
    def test_magic_genie_2(self, mock_print):
        with patch('builtins.input', side_effect=self.side_effect):
            Lab1_04.magic_genie_2() 
        args, kwargs = mock_print.call_args_list[2]
        print(mock_print.call_args)
        mock_print.assert_any_call("Your wishes are 1, 2 and 3")

    # input
    @patch("sys.stdout.write")
    def test_magic_genie_3(self, mock_print):
        with patch('builtins.input', side_effect=self.side_effect):
            Lab1_04.magic_genie_3() 
        args, kwargs = mock_print.call_args_list[2]
        print(mock_print.call_args)
        mock_print.assert_any_call("Your wishes are 2, 3 and 1")


if __name__ == '__main__':
    unittest.main() 
