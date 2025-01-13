import React from 'react';

const PaymentTable = ({ payments, balance }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Amount</th>
          <th>Remaining Balance</th>
          <th>Payment Method</th>
        </tr>
      </thead>
      <tbody>
        {payments.map((payment, index) => (
          <tr key={index}>
            <td>{payment.date}</td>
            <td>{payment.amount}</td>
            <td>{payment.remainingBalance}</td>
            <td>{payment.method}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PaymentTable;
