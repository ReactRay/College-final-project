import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.config';
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register necessary components with ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

function Statistics() {
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [mostLovedCar, setMostLovedCar] = useState('');
  const [mostLovedCategory, setMostLovedCategory] = useState('');
  const [totalRentals, setTotalRentals] = useState(0);
  const [jobsPerDay, setJobsPerDay] = useState({});
  const [earningsPerCar, setEarningsPerCar] = useState({});
  const [rentalData, setRentalData] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const requestsSnapshot = await getDocs(collection(db, 'requests'));
      const requests = requestsSnapshot.docs.map((doc) => doc.data());

      let totalEarnings = 0;
      let totalRentals = 0;
      const carCount = {};
      const categoryCount = {};
      const jobsPerDay = {};
      const earningsPerCar = {};

      requests.forEach((request) => {
        totalEarnings += parseFloat(request.sum);
        totalRentals += 1;

        const carName = `${request.make} ${request.model}`;
        const rentalDate = request.startDate.toDate().toLocaleDateString();

        // Count car popularity
        carCount[carName] = (carCount[carName] || 0) + 1;

        // Count category popularity
        categoryCount[request.category] =
          (categoryCount[request.category] || 0) + 1;

        // Jobs per day
        jobsPerDay[rentalDate] = (jobsPerDay[rentalDate] || 0) + 1;

        // Earnings per car
        earningsPerCar[carName] =
          (earningsPerCar[carName] || 0) + parseFloat(request.sum);
      });

      const mostLovedCar = Object.keys(carCount).reduce((a, b) =>
        carCount[a] > carCount[b] ? a : b
      );
      const mostLovedCategory = Object.keys(categoryCount).reduce((a, b) =>
        categoryCount[a] > categoryCount[b] ? a : b
      );

      setRentalData({
        labels: Object.keys(carCount),
        datasets: [
          {
            label: 'Car Popularity',
            data: Object.values(carCount),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
            ],
          },
        ],
      });

      setCategoryData({
        labels: Object.keys(categoryCount),
        datasets: [
          {
            label: 'Category Popularity',
            data: Object.values(categoryCount),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
            ],
          },
        ],
      });

      setTotalEarnings(totalEarnings);
      setTotalRentals(totalRentals);
      setJobsPerDay(jobsPerDay);
      setEarningsPerCar(earningsPerCar);
      setMostLovedCar(mostLovedCar);
      setMostLovedCategory(mostLovedCategory);
      setLoading(false);
    };

    fetchData();
  }, []);

  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#f4f7fc',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    heading: {
      textAlign: 'center',
      marginBottom: '30px',
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '20px',
      marginBottom: '40px',
    },
    statBox: {
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      borderLeft: '4px solid #36A2EB',
      position: 'relative',
      minWidth: '150px', // Added min-width to prevent overflow
    },
    statTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#555',
      marginBottom: '10px',
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      wordWrap: 'break-word', // Ensure long numbers break to the next line
    },
    progress: {
      height: '8px',
      width: '100%',
      backgroundColor: '#e0e0e0',
      borderRadius: '5px',
      marginTop: '10px',
    },
    progressBar: (percentage) => ({
      height: '100%',
      width: `${percentage}%`,
      backgroundColor: '#36A2EB',
      borderRadius: '5px',
      transition: 'width 0.3s ease-in-out',
    }),
    chartsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '40px',
    },
    chartBox: {
      backgroundColor: '#fff',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    earningsContainer: {
      marginTop: '30px',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    earningsTitle: {
      fontSize: '22px',
      fontWeight: 'bold',
      marginBottom: '20px',
      textAlign: 'center',
    },
    earningsList: {
      listStyleType: 'none',
      padding: 0,
    },
    earningsItem: {
      padding: '10px 0',
      borderBottom: '1px solid #eee',
      fontSize: '16px',
      color: '#555',
    },
  };

  const progressBarPercentage = (carEarnings, totalEarnings) =>
    (carEarnings / totalEarnings) * 100;

  if (loading) return <p>Loading statistics...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Admin Dashboard - Statistics Overview</h2>

      <div style={styles.statsContainer}>
        <div style={styles.statBox}>
          <p style={styles.statTitle}>Total Earnings</p>
          <p style={styles.statValue}>{totalEarnings.toFixed(2)} ILS</p>
          <div style={styles.progress}>
            <div
              style={styles.progressBar(
                Math.min((totalEarnings / 10000) * 100, 100)
              )}
            />
          </div>
        </div>
        <div style={styles.statBox}>
          <p style={styles.statTitle}>Total Rentals</p>
          <p style={styles.statValue}>{totalRentals}</p>
          <div style={styles.progress}>
            <div
              style={styles.progressBar(
                Math.min((totalRentals / 50) * 100, 100)
              )}
            />
          </div>
        </div>
        <div style={styles.statBox}>
          <p style={styles.statTitle}>Most Loved Car</p>
          <p style={styles.statValue}>{mostLovedCar}</p>
        </div>
        <div style={styles.statBox}>
          <p style={styles.statTitle}>Most Loved Category</p>
          <p style={styles.statValue}>{mostLovedCategory}</p>
        </div>
      </div>

      <div style={styles.chartsContainer}>
        <div style={styles.chartBox}>
          <h4 style={styles.statTitle}>Car Popularity</h4>
          <Pie data={rentalData} />
        </div>
        <div style={styles.chartBox}>
          <h4 style={styles.statTitle}>Category Popularity</h4>
          <Doughnut data={categoryData} />
        </div>
      </div>

      <div style={styles.earningsContainer}>
        <h4 style={styles.earningsTitle}>Earnings Breakdown per Car</h4>
        <ul style={styles.earningsList}>
          {Object.keys(earningsPerCar).map((car) => (
            <li key={car} style={styles.earningsItem}>
              {car}: {earningsPerCar[car].toFixed(2)} ILS
              <div style={styles.progress}>
                <div
                  style={styles.progressBar(
                    progressBarPercentage(earningsPerCar[car], totalEarnings)
                  )}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Statistics;
