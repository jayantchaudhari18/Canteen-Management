import React, { useState, useEffect, useCallback } from "react";
import { database } from "../../firebase";
import { ref, onValue, update, push } from "firebase/database";
import {
  Card,
  Container,
  Row,
  Col,
  Table,
  Form,
  Button,
} from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const AdminPanel = () => {
  const [salesData, setSalesData] = useState({
    weekly: [],
    monthly: [],
    yearly: [],
    bestSellers: [],
  });
  const [initialPrices, setInitialPrices] = useState({});
  const [products, setProducts] = useState({});
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImage, setProductImage] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantityChange, setQuantityChange] = useState("");

  const processData = useCallback(
    (data) => {
      // If data is null or undefined, return empty state
      if (!data) {
        return {
          weekly: [],
          monthly: [],
          yearly: [],
          bestSellers: [],
        };
      }

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      const oneYearAgo = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );

      const bestSellers = {};
      const weekly = {};
      const monthly = {};
      const yearly = {};

      Object.entries(data).forEach(([date, dailySales]) => {
        // Skip if dailySales is null or undefined
        if (!dailySales) return;

        const saleDate = new Date(date);

        // Ensure dailySales is treated as an object
        Object.values(dailySales).forEach((sale) => {
          // Skip if sale or items is null/undefined
          if (!sale || !sale.items || !Array.isArray(sale.items)) return;

          sale.items.forEach((item) => {
            // Skip if item is invalid
            if (!item || !item.id || !item.quantity || !item.price) return;

            // Track the number of items sold for best sellers
            bestSellers[item.id] = (bestSellers[item.id] || 0) + item.quantity;

            const revenue = item.price * item.quantity;
            const cost = (initialPrices[item.id] || 0) * item.quantity;
            const profit = revenue - cost;

            // Calculate weekly, monthly, and yearly profits
            if (saleDate >= oneWeekAgo) {
              weekly[item.id] = (weekly[item.id] || 0) + profit;
            }
            if (saleDate >= oneMonthAgo) {
              monthly[item.id] = (monthly[item.id] || 0) + profit;
            }
            if (saleDate >= oneYearAgo) {
              yearly[item.id] = (yearly[item.id] || 0) + profit;
            }
          });
        });
      });

      // Sort best sellers by quantity sold
      const sortedBestSellers = Object.entries(bestSellers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Safe conversion to the required format
      const convertToChartFormat = (data) =>
        Object.entries(data)
          .map(([id, value]) => ({
            name: products[id]?.name || "Unknown Product",
            value: value || 0,
          }))
          .filter((item) => item.name !== "Unknown Product");

      return {
        weekly: convertToChartFormat(weekly),
        monthly: convertToChartFormat(monthly),
        yearly: convertToChartFormat(yearly),
        bestSellers: sortedBestSellers.map(([id, quantity]) => ({
          id,
          name: products[id]?.name || "Unknown Product",
          quantity,
        })),
      };
    },
    [initialPrices, products]
  );

  useEffect(() => {
    const salesRef = ref(database, "sales");
    const productsRef = ref(database, "products");

    // Fetch initial prices and product data
    const productsUnsubscribe = onValue(
      productsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const prices = Object.entries(data).reduce((acc, [id, product]) => {
            acc[id] = product.initialPrice || 0;
            return acc;
          }, {});
          setInitialPrices(prices);
          setProducts(data);
        }
      },
      (error) => {
        console.error("Error fetching products:", error);
      }
    );

    // Fetch sales data
    const salesUnsubscribe = onValue(
      salesRef,
      (snapshot) => {
        const data = snapshot.val();
        const processedData = processData(data);
        setSalesData(processedData);
      },
      (error) => {
        console.error("Error fetching sales:", error);
      }
    );

    // Cleanup subscriptions
    return () => {
      productsUnsubscribe();
      salesUnsubscribe();
    };
  }, [processData]);

  // Function to add product to Firebase
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const newProduct = {
        name: productName,
        price: parseFloat(productPrice),
        description: productDescription,
        image: productImage,
        quantity: 0,
        initialPrice: parseFloat(productPrice),
      };

      const productsRef = ref(database, "products");
      await push(productsRef, newProduct);

      // Reset the form
      setProductName("");
      setProductPrice("");
      setProductDescription("");
      setProductImage("");

      alert("Product added successfully!");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    }
  };

  // Function to update the quantity of an existing product
  const handleUpdateQuantity = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !quantityChange) return;

    try {
      const productRef = ref(database, `products/${selectedProduct}`);
      const currentQuantity = products[selectedProduct]?.quantity || 0;
      const newQuantity = currentQuantity + parseInt(quantityChange);

      if (newQuantity < 0) {
        alert("Quantity cannot be negative!");
        return;
      }

      // Update product's quantity in Firebase
      await update(productRef, {
        quantity: newQuantity,
      });

      // Reset the form
      setSelectedProduct("");
      setQuantityChange("");

      alert("Quantity updated successfully!");
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity. Please try again.");
    }
  };

  const renderPieChart = (data, title) => (
    <Card className="mb-4">
      <Card.Header>{title}</Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );

  const renderSummary = (data, title) => {
    const totalProfit = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <Card className="mb-4">
        <Card.Header>{title} Summary</Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Profit (₹)</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>₹{item.value.toFixed(2)}</td>
                    <td>{((item.value / totalProfit) * 100).toFixed(2)}%</td>
                  </tr>
                ))}
                <tr className="table-info">
                  <td>
                    <strong>Total</strong>
                  </td>
                  <td>
                    <strong>₹{totalProfit.toFixed(2)}</strong>
                  </td>
                  <td>100%</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const renderBestSellers = (bestSellers) => (
    <Card className="mb-4">
      <Card.Header>Best-Selling Products</Card.Header>
      <Card.Body>
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity Sold</th>
              </tr>
            </thead>
            <tbody>
              {bestSellers.map((product, index) => (
                <tr key={index}>
                  <td>{product.name}</td>
                  <td>{product.quantity}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );

  const renderAddProductForm = () => (
    <Card className="mb-4">
      <Card.Header>Add New Product</Card.Header>
      <Card.Body>
        <Form onSubmit={handleAddProduct}>
          <Form.Group controlId="productName">
            <Form.Label>Product Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="productPrice" className="mt-3">
            <Form.Label>Product Price (₹)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter product price"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="productDescription" className="mt-3">
            <Form.Label>Product Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter product description"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="productImage" className="mt-3">
            <Form.Label>Product Image URL</Form.Label>
            <Form.Control
              type="url"
              placeholder="Enter product image URL"
              value={productImage}
              onChange={(e) => setProductImage(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-4">
            Add Product
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );

  const renderUpdateQuantityForm = () => (
    <Card className="mb-4">
      <Card.Header>Update Product Quantity</Card.Header>
      <Card.Body>
        <Form onSubmit={handleUpdateQuantity}>
          <Form.Group controlId="selectProduct">
            <Form.Label>Select Product</Form.Label>
            <Form.Control
              as="select"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              required
            >
              <option value="">Select a product...</option>
              {Object.entries(products).map(([id, product]) => (
                <option key={id} value={id}>
                  {product.name} (Current Quantity: {product.quantity || 0})
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="quantityChange" className="mt-3">
            <Form.Label>Quantity Change (Increase/Decrease)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter quantity to add (positive) or remove (negative)"
              value={quantityChange}
              onChange={(e) => setQuantityChange(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-4">
            Update Quantity
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid>
      <h1 className="my-4">Admin Panel</h1>
      <Row>
        <Col xs={12} md={6} lg={4}>
          {renderPieChart(salesData.weekly, "Weekly Profit Distribution")}
          {renderSummary(salesData.weekly, "Weekly")}
        </Col>
        <Col xs={12} md={6} lg={4}>
          {renderPieChart(salesData.monthly, "Monthly Profit Distribution")}
          {renderSummary(salesData.monthly, "Monthly")}
        </Col>
        <Col xs={12} md={6} lg={4}>
          {renderPieChart(salesData.yearly, "Yearly Profit Distribution")}
          {renderSummary(salesData.yearly, "Yearly")}
        </Col>
      </Row>
      <Row>
        <Col xs={12}>{renderBestSellers(salesData.bestSellers)}</Col>
      </Row>
      <Row>
        <Col xs={12} md={6}>
          {renderAddProductForm()}
        </Col>
        <Col xs={12} md={6}>
          {renderUpdateQuantityForm()}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPanel;
