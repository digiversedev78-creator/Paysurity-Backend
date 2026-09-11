'use client';

import React, { useState, useEffect } from 'react';

type StationType = 'Grill' | 'Curry/Wok' | 'Fryer' | 'Assembly/Cold';

interface Ticket {
  station: StationType;
  item: string;
  quantity: number;
}

interface KDSOrder {
  orderId: string;
  tickets: Ticket[];
  timestamp: string;
}

export default function KDSView() {
  const [orders, setOrders] = useState<KDSOrder[]>([]);

  useEffect(() => {
    // Simulated Socket.io Listener mapping to Drizzle Vector Mesh
    const socketInterval = setInterval(() => {
        // Poll backend API or listen securely for new CRDT mesh transactions
        // Mock payload mimicking the `processKitchenMeshOrder` output
        if (Math.random() > 0.7) {
            const newOrder: KDSOrder = {
                orderId: `KDS-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                tickets: [
                    { station: 'Assembly/Cold', item: 'Hyderabadi Goat Dum Biryani', quantity: 2 },
                    { station: 'Grill', item: 'Chicken Tikka Boti', quantity: 1 }
                ]
            };
            setOrders(prev => [newOrder, ...prev].slice(0, 10)); // keep last 10
        }
    }, 5000);

    return () => clearInterval(socketInterval);
  }, []);

  const getStationColor = (station: StationType) => {
      switch(station) {
          case 'Grill': return 'bg-red-500';
          case 'Curry/Wok': return 'bg-orange-500';
          case 'Fryer': return 'bg-yellow-500 text-black';
          case 'Assembly/Cold': return 'bg-blue-500';
          default: return 'bg-gray-500';
      }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-mono">
      <header className="flex justify-between border-b-4 border-green-500 pb-4 mb-6">
        <h1 className="text-4xl font-black tracking-tighter">SOVEREIGN KITCHEN DISPLAY MESH</h1>
        <div className="text-green-500 text-lg flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></span>
            LIVE V-CLOCK SYNC
        </div>
      </header>
      
      {orders.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500 text-2xl">
              Waiting for incoming HSM Spools...
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
                <div key={order.orderId} className="border-2 border-gray-800 rounded bg-gray-900 p-4 shadow-xl">
                    <div className="flex justify-between items-center bg-gray-800 p-2 font-bold mb-4">
                        <span className="text-xl">{order.orderId}</span>
                        <span className="text-sm text-gray-400">{order.timestamp}</span>
                    </div>
                    <ul className="space-y-3 relative">
                        {order.tickets.map((ticket, idx) => (
                            <li key={idx} className="flex justify-between text-lg items-center border-b border-gray-800 pb-2">
                                <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 flex items-center justify-center font-bold rounded ${getStationColor(ticket.station)}`}>
                                      {ticket.quantity}x
                                   </div>
                                   {ticket.item}
                                </div>
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${getStationColor(ticket.station)}`}>
                                    {ticket.station}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <button className="w-full mt-6 bg-green-600 hover:bg-green-500 text-black font-black uppercase tracking-widest py-3 rounded">
                        BUMP ORDER
                    </button>
                </div>
            ))}
          </div>
      )}
    </div>
  );
}
