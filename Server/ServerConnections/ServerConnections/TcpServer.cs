/* TcpServer.cs
 * A tcp listener for connections. Waits for a connection, spits them out as they connect.
 * 
 * Revision History
 *      Quinlan Vannatter, 2016.06.02: Created
 *      
 */

using System.Net;
using System.Net.Sockets;
using System.Threading;

namespace ServerConnections
{
    public class TcpServer
    {
        // Buffer size default.
        private const int DEFAULT_BUFFER_SIZE = 500;

        // Listens for connections.
        private TcpListener server;

        // While the server is alive.
        private bool alive;

        // Buffer size.
        public int BufferSize { get; set; }

        // Event handlers.
        public delegate void ClientConnectHandler(object sender, TcpConnection client);
        public delegate void ConnectionClosedHandler(object sender);

        // Events.
        public event ClientConnectHandler ClientConnectEvent;
        public event ConnectionClosedHandler ConnectionClosedEvent;

        /// <summary>
        /// Constructor for a TCP server that accepts incoming connections.
        /// </summary>
        /// <param name="port">Port that the server will listen on.</param>
        public TcpServer(int port, int bufferSize = DEFAULT_BUFFER_SIZE)
        {
            // Establish the listener.
            server = new TcpListener(new IPEndPoint(IPAddress.Any, port));

            // Start listening.
            server.Start();

            // Set the buffer size.
            BufferSize = bufferSize;

            // Server is alive.
            alive = true;

            // Start the thread for waiting for connections.
            new Thread(new ThreadStart(TcpWait)).Start();
        }

        /// <summary>
        /// Closes the connection for the server.
        /// </summary>
        /// <returns>True if closing was successful.</returns>
        public bool Close()
        {
            try
            {
                // Attempt to close the connection to the server.
                server.Stop();

                // Indicate the client is no longer alive.
                alive = false;
                return true;
            }
            catch
            {
                // If there was an issue closing the connection, return false.
                return false;
            }
        }

        /// <summary>
        /// Waits for connections and returns them.
        /// </summary>
        private void TcpWait()
        {
            // While the connection is alive.
            while(alive)
            {
                try
                {
                    // Wait for a client to connect.
                    ClientConnect(server.AcceptTcpClient());
                }
                catch
                {
                    // If there was an error, connection is no longer alive.
                    alive = false;
                }
            }

            // Connection is now closed.
            ConnectionClosed();
        }
        
        /// <summary>
        /// Called when a client connects, returns the client as a TCP connection.
        /// </summary>
        /// <param name="client">Client returned from the listener.</param>
        private void ClientConnect(TcpClient client)
        {
            ClientConnectEvent?.Invoke(this, new TcpConnection(client, BufferSize));
        }

        /// <summary>
        /// When the connection is closed, trigger this event.
        /// </summary>
        private void ConnectionClosed()
        {
            ConnectionClosedEvent?.Invoke(this);
        }
    }
}
