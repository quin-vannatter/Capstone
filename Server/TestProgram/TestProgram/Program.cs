using ServerConnections;
using System;
using System.Collections.Generic;
using System.Text;

namespace TestProgram
{
    class Program
    {
        private static List<TcpConnection> connections = new List<TcpConnection>();
        private static bool connected = false;
        static void Main(string[] args)
        {
            TcpServer server = new TcpServer(70);
            server.ClientConnectEvent += Server_ClientConnectEvent;
            while(true)
            {
                byte [] data = ASCIIEncoding.ASCII.GetBytes(Console.ReadLine());
                foreach (TcpConnection connection in connections) connection.WriteData(data);
            }
        }

        private static void Server_ClientConnectEvent(object sender, TcpConnection client)
        {
            Console.WriteLine("Client Connected");
            client.ReadDataEvent += Client_ReadDataEvent;
            connections.Add(client);
        }

        private static void Client_ReadDataEvent(object sender, byte[] data)
        {
            if (!connected)
            {
                byte[] response = WebSocket.CreateHandshake(data);
                ((TcpConnection)sender).WriteData(response);
                connected = true;
            }
            else
            {
                string message = WebSocket.GetDecodedData(data, data.Length);
                Console.WriteLine(message);
            }
        }
    }
}
