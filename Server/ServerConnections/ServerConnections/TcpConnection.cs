/* TcpConnection.cs
 * A tcp connection between two locations. This class handles sending and recieving data.
 * 
 * Revision History
 *      Quinlan Vannatter, 2016.06.02: Created
 *      
 */

using System.Net.Sockets;
using System.Threading;

namespace ServerConnections
{
    public class TcpConnection
    {
        // Number of bytes for buffer size if size isn't supplied.
        private const int DEFAULT_BUFFER_SIZE = 500;

        // Client that handles everything in class.
        private TcpClient client;

        // Buffer size for reading bytes.
        public int BufferSize { get; set; }

        // If the connection is still alive.
        private bool alive;

        // Event handlers.
        public delegate void ReadDataHandler(object sender, byte[] data);
        public delegate void ConnectionClosedHandler(object sender);

        // Events.
        public event ReadDataHandler ReadDataEvent;
        public event ConnectionClosedHandler ConnectionClosedEvent;

        /// <summary>
        /// Constructor for a TCP connection. Used for the creation of a client (Not created from a listener).
        /// </summary>
        /// <param name="hostName">Host name of the destination connection.</param>
        /// <param name="port">Port of the destination connection.</param>
        /// <param name="bufferSize">Buffer size of the connection for reading and writting.</param>
        public TcpConnection(string hostName, int port, int bufferSize = DEFAULT_BUFFER_SIZE)
        {
            // Create the TCP cleint.
            client = new TcpClient();

            // Connect to the destination.
            client.Connect(hostName, port);

            // Set up the buffer size.
            BufferSize = bufferSize;

            // Client connection is alive.
            alive = true;
        }

        /// <summary>
        /// Constructor for a TCP connection. Used when connecting with a server.
        /// </summary>
        /// <param name="client">Client connected from server.</param>
        /// <param name="bufferSize">Size of buffer for reading and writting.</param>
        public TcpConnection(TcpClient client, int bufferSize = DEFAULT_BUFFER_SIZE)
        {
            // Set the class client to the parameter client.
            this.client = client;

            // Set the buffer size.
            BufferSize = bufferSize;

            // Client connection is alive.
            alive = true;

            // Start the thread to check for read data.
            new Thread(new ThreadStart(TcpWait)).Start();
        }

        /// <summary>
        /// Waits for a read from the client, triggers an event.
        /// </summary>
        private void TcpWait()
        {
            // While the connection is alive.
            while(alive)
            {
                try
                {
                    // Read data will be put in this buffer.
                    byte[] buffer = new byte[BufferSize];
                    client.GetStream().Read(buffer, 0, buffer.Length);

                    // Checking to make sure buffer is valid.
                    alive = false;
                    foreach (byte value in buffer) alive = alive || value != 0;

                    // Trigger the event.
                    if (alive) ReadData(buffer);
                }
                catch
                {

                    // Client is no longer alive.
                    alive = false;
                }
            }

            // Indicate that the connection is closed.
            ConnectionClosed();
        }

        /// <summary>
        /// Writes data to the stream of the TCP client.
        /// </summary>
        /// <param name="data">Data being written to the client.</param>
        public bool WriteData(byte [] data)
        {
            try
            {
                // Write to the client stream.
                client.GetStream().Write(data, 0, data.Length);
                return true;
            }
            catch
            {
                // If there was an issue, indicate the connection is dead. Return false.
                alive = false;
                return false;
            }
        }
        
        /// <summary>
        /// Closes the connection for the client.
        /// </summary>
        /// <returns>True if closing was successful.</returns>
        public bool Close()
        {
            try
            {
                // If the connection is still alive
                if (client.Connected)
                {
                    // Attempt to close the connection to the server.
                    client.Close();
                }

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
        /// Invokes the event for reading data.
        /// </summary>
        /// <param name="data">Data that is recieved from the client.</param>
        private void ReadData(byte [] data)
        {
            //ReadDataEvent?.Invoke(this, data);

            // 4.5 Framework.
            if(ReadDataEvent != null) ReadDataEvent(this, data);
        }

        /// <summary>
        /// When the connection is closed, trigger this event.
        /// </summary>
        private void ConnectionClosed()
        {
            //ConnectionClosedEvent?.Invoke(this);

            // 4.5 Framework.
            if(ConnectionClosedEvent != null) ConnectionClosedEvent(this);
        }
    }
}
