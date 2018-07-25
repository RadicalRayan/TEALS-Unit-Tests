from __future__ import print_function
import studentFile
import unittest
import sys
import io
import random
from unittest.mock import patch

class UnitTests(unittest.TestCase):
    def setUp(self):
        self.incrementingValue = 0

    #random
    @patch("random.randint")
    def test_cards(self, mockRandInt):
        mockRandInt.return_value = 1
        result = studentFile.cards()
        self.assertEqual(result, "2 Clubs")

    #arguments passing in
    def test_birthday_song(self):
        song = 'happy birthday to you, happy birthday to you, happy birthday dear TEALS, happy birthday to you'
        self.assertEqual(studentFile.birthday_song('TEALS'), song)

    #printing
    @patch('sys.stdout.write')
    def test_hello_world(self, mock_print):
        studentFile.hello_world()
        mock_print.assert_called();
        mock_print.assert_any_call('Hello World')
    
    def side_effect(self, value):
        self.incrementingValue = 1 + self.incrementingValue
        return str(self.incrementingValue)

    # input
    @patch("sys.stdout.write")
    def test_input(self, mock_print):
        with patch('builtins.input', side_effect=self.side_effect):
            studentFile.magicGenie() 
        args, kwargs = mock_print.call_args_list[2]
        print(mock_print.call_args)
        mock_print.assert_any_call("Your wishes are 1, 2 and 3")


if __name__ == '__main__':
    unittest.main() 
