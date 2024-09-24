import React, { useState, useEffect, useCallback } from "react";
import { database } from "../../firebase";
import { ref, onValue } from "firebase/database";
import { Card, Container, Row, Col, Table } from "react-bootstrap";
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
  const [products, setProducts] = useState({}); // To store product data

  // Memoized processData function to prevent re-creation on each render
  const processData = useCallback(
    (data) => {
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

      const bestSellers = {}; // Track quantities of each product

      const weekly = {};
      const monthly = {};
      const yearly = {};

      Object.entries(data).forEach(([date, dailySales]) => {
        const saleDate = new Date(date);
        Object.values(dailySales).forEach((sale) => {
          sale.items.forEach((item) => {
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
        .slice(0, 5); // Show top 5 best-selling products

      return {
        weekly: Object.entries(weekly).map(([id, value]) => ({
          name: products[id]?.name, // Safely access the product name
          value,
        })),
        monthly: Object.entries(monthly).map(([id, value]) => ({
          name: products[id]?.name,
          value,
        })),
        yearly: Object.entries(yearly).map(([id, value]) => ({
          name: products[id]?.name,
          value,
        })),
        bestSellers: sortedBestSellers.map(([id, quantity]) => ({
          id,
          name: products[id]?.name,
          quantity,
        })),
      };
    },
    [initialPrices, products]
  ); // Dependencies: initialPrices and products

  useEffect(() => {
    const salesRef = ref(database, "sales");
    const productsRef = ref(database, "products");

    // Fetch initial prices and product data
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const prices = Object.entries(data).reduce((acc, [id, product]) => {
          acc[id] = product.initialPrice;
          return acc;
        }, {});
        setInitialPrices(prices);
        setProducts(data); // Save the product data for best sellers
      }
    });

    // Fetch sales data
    onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const processedData = processData(data);
        setSalesData(processedData);
      }
    });
  }, [processData]);

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
            <Tooltip />
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
                <tr>
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
    </Container>
  );
};

export default AdminPanel;
