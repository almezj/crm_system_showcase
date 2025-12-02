import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const OrderTrendsChart = ({ orderTrends = [] }) => {
  const data = {
    labels: orderTrends.map(item => item.month) || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Orders",
        data: orderTrends.map(item => item.count) || [0, 0, 0, 0, 0, 0],
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "category",
        display: true,
      },
      y: {
        type: "linear",
        display: true,
        beginAtZero: true,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default OrderTrendsChart;
