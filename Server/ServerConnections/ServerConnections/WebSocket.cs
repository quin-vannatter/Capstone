/* WebSocket.cs
 * Various methods that help to communicate with a Web Socket.
 * 
 * Revision History
 *      Quinlan Vannatter, 2016.06.02: Created
 *      
 */

using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace ServerConnections
{
    public static class WebSocket
    {
        // Delimiter for each line of the header.
        private const string LINE_DELIMITER = "\r\n";
        private const string KEY_VALUE_DELIMITER = ": ";

        private const string KEY_TITLE = "Title";
        private const string KEY_ACCCEPT = "Sec-WebSocket-Accept";
        private const string KEY_SOCKETKEY = "Sec-WebSocket-Key";
        private const string GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

        private static readonly Dictionary<string, string> WEB_SOCKET_RESPONSE = new Dictionary<string, string>()
        {
            {"Title","HTTP/1.1 101 Switching Protocols"},
            {"Upgrade","websocket"},
            {"Connection","Upgrade"},
            {"Sec-WebSocket-Accept",""}
        };

        /// <summary>
        /// Creates a response for a web socket connection to complete handshake.
        /// </summary>
        /// <param name="data">The header sent by the web socket</param>
        /// <returns>Response data that is the response.</returns>
        public static byte [] CreateHandshake(byte [] data)
        {
            // Get the header and the response.
            Dictionary<string, string> header = ParseHeader(data);
            Dictionary<string, string> response = WEB_SOCKET_RESPONSE;

            // Create the response key.
            response[KEY_ACCCEPT] = ParseWebSocketKey(header[KEY_SOCKETKEY]);

            // Return the response.
            return CrearteHeader(response);
        }

        /// <summary>
        /// Parses an HTTP style header into key value pairs.
        /// </summary>
        /// <param name="data">Input data to be parsed.</param>
        /// <returns></returns>
        public static Dictionary<string,string> ParseHeader(byte [] data)
        {
            // Convert the byte array into a string.
            string input = ASCIIEncoding.ASCII.GetString(data);

            // Holds the key value pairs generated.
            Dictionary<string, string> results = new Dictionary<string, string>();

            // Split each line.
            string [] lines = input.Split(new string[] { LINE_DELIMITER }, StringSplitOptions.RemoveEmptyEntries);

            // If there are results. First line is the title.
            if(lines.Length > 0) results.Add(KEY_TITLE, lines[0]);

            // Loop through each line.
            foreach (string line in lines)
            {

                // Try and create and add a key value pair.
                string[] values = line.Split(new string[] { KEY_VALUE_DELIMITER }, StringSplitOptions.RemoveEmptyEntries);
                if (values.Length == 2) results.Add(values[0], values[1]);
            }

            return results;
        }
        
        /// <summary>
        /// Takes a websocket key and produces the accept.
        /// </summary>
        /// <param name="key">The key being sent.</param>
        /// <returns>The correct response using the key.</returns>
        public static string ParseWebSocketKey(string key)
        {
            byte[] data = ASCIIEncoding.ASCII.GetBytes(key.Trim() + GUID);
            byte[] hash = new SHA1Managed().ComputeHash(data);
            return Convert.ToBase64String(hash);
        }

        public static string GetDecodedData(byte[] buffer, int length)
        {
            byte b = buffer[1];
            int dataLength = 0;
            int totalLength = 0;
            int keyIndex = 0;

            if (b - 128 <= 125)
            {
                dataLength = b - 128;
                keyIndex = 2;
                totalLength = dataLength + 6;
            }

            if (b - 128 == 126)
            {
                dataLength = BitConverter.ToInt16(new byte[] { buffer[3], buffer[2] }, 0);
                keyIndex = 4;
                totalLength = dataLength + 8;
            }

            if (b - 128 == 127)
            {
                dataLength = (int)BitConverter.ToInt64(new byte[] { buffer[9], buffer[8], buffer[7], buffer[6], buffer[5], buffer[4], buffer[3], buffer[2] }, 0);
                keyIndex = 10;
                totalLength = dataLength + 14;
            }

            byte[] key = new byte[] { buffer[keyIndex], buffer[keyIndex + 1], buffer[keyIndex + 2], buffer[keyIndex + 3] };

            int dataIndex = keyIndex + 4;
            int count = 0;
            for (int i = dataIndex; i < totalLength; i++)
            {
                buffer[i] = (byte)(buffer[i] ^ key[count % 4]);
                count++;
            }

            return Encoding.ASCII.GetString(buffer, dataIndex, dataLength);
        }

        /// <summary>
        /// Creates a header response from a dictionary.
        /// </summary>
        /// <param name="header">Dictionary being converted into a string</param>
        /// <returns></returns>
        public static byte [] CrearteHeader(Dictionary<string,string> data)
        {
            // Will hold the base header lines.
            List<string> lines = new List<string>();

            // Add only the value of the title key.
            lines.Add(data[KEY_TITLE]);

            // Loop through the key value pairs.
            foreach (KeyValuePair<string, string> pair in data)
            {
                // Only add if the pair is not the title.
                if (pair.Key != KEY_TITLE)
                {
                    lines.Add(string.Join(KEY_VALUE_DELIMITER, new string[] { pair.Key, pair.Value }));
                }
            }
            
            // Ending the response.
            lines.Add(LINE_DELIMITER);

            // Return the lines as a byte array.
            return ASCIIEncoding.ASCII.GetBytes(string.Join(LINE_DELIMITER, lines));
        }
    }
}
