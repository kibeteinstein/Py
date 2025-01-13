import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentsPerDay = () => {
    const [payments, setPayments] = useState([]);
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (date) {
            fetchPayments();
        }
    }, [date]);

    const fetchPayments = async () => {
        setLoading(true);
        setError(''); // Reset error message before fetching

        try {
            const response = await axios.get(`https://back-end2-dl6sdah86-stanoos-projects.vercel.app/payments`, {
                params: { date }
            });
            setPayments(response.data);
        } catch (error) {
            console.error('Error fetching payments', error);
            setError('Failed to load payments for the selected date. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Payments on {date ? new Date(date).toLocaleDateString() : 'Select a date'}</h2>
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />
            {loading && <p>Loading payments...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <table>
                <thead>
                    <tr>
                        <th>Admission Number</th>
                        <th>Amount</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => (
                        <tr key={payment.id}>
                            <td>{payment.admission_number}</td>
                            <td>{payment.amount.toFixed(2)}</td>
                            <td>{new Date(payment.date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {payments.length === 0 && !loading && (
                        <tr>
                            <td colSpan="3">No payments found for this date.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PaymentsPerDay;
