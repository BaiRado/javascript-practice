import React from 'react';
import './App.css';
import Filter from "./components/filter";
import Cart from "./components/cart";
import ProductList from "./components/product-list";

import store from './store';

function App() {
  return (
    <div className="App">

      <Filter store={store} />
      <Cart store={store} />
      <main className="main">
        <ProductList store={store} />
      </main>

    </div >
  );
}

export default App;