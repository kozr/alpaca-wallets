"use client"

import React, { useState } from "react";

export default function Home() {
  const [wallets, setWallets] = useState([]);
  const [walletMap, setWalletMap] = useState({});

  const fetchWalletBalances = async () => {
    const response = await fetch(`/api/wallets?addresses=${wallets}`);
    const data = await response.json(); // [{"5gKHLHkfBpU2Qqzc1egX3qMV1WjAwJpqPK5jjMzySaFD":[{"turtlewifhat":1280947}]}}]
    setWalletMap(data);
  }

  const onChange = (e) => {
    const values = e.target.value.split(',').map((v) => v.trim())
    setWallets(values)
  }

  return (
    <div className="">
      <div className="flex justify-center">
        <p className="p-2 text-md">Enter Wallet Addresss:</p>
        <input
          className="p-2 w-[75%] text-md border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          onChange={onChange}
        />
      
        <button
          className="p-2 text-md font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          onClick={fetchWalletBalances}
        >
          Fetch Balances
        </button>
      </div>
    
      <div className="p-4 w-full text-md bg-gray-100 rounded-lg">
        <p>Wallets:</p>
        <ul>
          {Object.keys(walletMap).map((wallet) => (
            <li key={wallet}>
              <p>{wallet}</p>
              <ul>
                {Object.keys(walletMap[wallet]).map((subwallet) => (
                  <li key={subwallet}>
                    <ul>
                      {Object.keys(walletMap[wallet][subwallet]).map((name) => (
                        <li className="ml-3" key={name}>
                          <p>{name}: {walletMap[wallet][subwallet][name]}</p>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>  
    </div>
  );
}