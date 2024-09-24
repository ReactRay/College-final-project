import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.config';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';

// Register all necessary components with ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

function Statistics() {
  const [barData, setBarData] = useState({});
  const [lineData, setLineData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch requests data from Firestore
      const requestsSnapshot = await getDocs(collection(db, 'requests'));
      const requests = requestsSnapshot.docs.map((doc) => doc.data());

      // Example: Calculate data for Bar and Line charts
      const months = ['January', 'February', 'March', 'April', 'May', 'June'];
      const rentalCounts = [0, 0, 0, 0, 0, 0]; // Example rental data per month
      const earnings = [0, 0, 0, 0, 0, 0]; // Example earnings data per month

      requests.forEach((request) => {
        const requestMonth = request.startDate.toDate().getMonth(); // Assuming startDate is a timestamp
        rentalCounts[requestMonth] += 1;
        earnings[requestMonth] += parseFloat(request.sum); // Assuming sum is a string of a numeric value
      });

      setBarData({
        labels: months,
        datasets: [
          {
            label: 'Rentals Per Month',
            data: rentalCounts,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          },
        ],
      });

      setLineData({
        labels: months,
        datasets: [
          {
            label: 'Earnings Per Month',
            data: earnings,
            borderColor: 'rgba(53, 162, 235, 0.6)',
            fill: false,
          },
        ],
      });

      setLoading(false);
    };

    fetchData();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Rental and Earnings Statistics',
      },
    },
  };

  if (loading) return <p>Loading statistics...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Statistics Page</h2>
      <Bar data={barData} options={chartOptions} />
      <Line data={lineData} options={chartOptions} />
    </div>
  );
}

export default Statistics;
