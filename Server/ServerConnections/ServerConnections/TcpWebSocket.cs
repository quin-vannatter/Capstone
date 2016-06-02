/* TcpWebSocket.cs
 * Special TcpConnection that interacts with a web socket.
 * 
 * Revision History
 *      Quinlan Vannatter, 2016.06.02: Created
 *      
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ServerConnections
{
    public class TcpWebSocket
    {
        private TcpConnection connection;
        private bool connected;
        public TcpWebSocket(TcpConnection connection)
        {
            this.connection = connection;
            connection.ReadDataEvent += Connection_ReadDataEvent;
        }

        private void Connection_ReadDataEvent(object sender, byte[] data)
        {
            
        }
    }
}
