function getOrderDetailsHtml(order) {
  const formatCurrency = (amount) => {
    const symbol = order.currency_symbol || "AED";
    const rate = order.currency_rate;
    let value = parseFloat(amount);
    if (symbol && rate) {
      value = value * parseFloat(rate);
      return `AED${parseFloat(amount).toFixed(2)}(${symbol} ${value.toFixed(2)})`;
    }
    return `${symbol} ${value.toFixed(2)}`;
  };
  let serviceRows = "";
  const orderServices = order.orderServices || [];
  const orderTotal = order.orderTotal || {};
  for (const os of orderServices) {
    serviceRows += `
      <tr>
        <td><b>${os.service_name || ""}</b>${os.option_name ? `<br>${os.option_name}` : ''}</td>
        <td>${os.status || ""}</td>
        <td>${os.duration || ""}</td>
        <td>${os.price ? formatCurrency(os.price) : ""}</td>
      </tr>
    `;
  }
  return `
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <style>
        body { font-family: Arial, sans-serif; }
        h3 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <main role="main">
        <h3>New Order Place</h3>
        <table>
            <tr><td colspan="2">Order Details</td></tr>
            <tr>
                <td>
                    <b>Order ID:</b> #${order.id} <br><br>
                    <b>Date Added:</b> ${order.created_at || order.date || ""} <br><br>
                    <b>Order Status:</b> ${order.status || "Pending"}
                </td>
                <td>
                    <b>Total Amount:</b> ${formatCurrency(order.total_amount)} <br><br>
                    <b>Payment Method:</b> ${order.payment_method}
                </td>
            </tr>
        </table>
        <table>
            <tr><td colspan="3">Appointment Details</td></tr>
            <tr>
                <td><b>Staff:</b> ${order.staff_name || ""}</td>
                <td><b>Date:</b> ${order.date || ""}</td>
                <td><b>Time:</b> ${order.time_slot_value || ""}</td>
            </tr>
        </table>
        <table>
            <tr><td colspan="3">Address Details</td></tr>
            <tr>
                <td><b>Building Name:</b> ${order.buildingName || ""} <br><br><b>Area:</b> ${order.area || ""}</td>
                <td><b>Flat / Villa:</b> ${order.flatVilla || ""} <br><br><b>Land Mark:</b> ${order.landmark || ""}</td>
                <td><b>Street:</b> ${order.street || ""} <br><br><b>City:</b> ${order.city || ""}</td>
            </tr>
        </table>
        <table>
            <tr><td colspan="2">Customer Details</td></tr>
            <tr>
                <td>
                    <b>Name:</b> ${order.customer_name || ""} <br><br>
                    <b>Email:</b> ${order.customer_email || ""} <br><br>
                    <b>Gender:</b> ${order.gender || ""}
                </td>
                <td>
                    <b>Phone Number:</b> ${order.number || ""} <br><br>
                    <b>Whatsapp Number:</b> ${order.whatsapp || ""}
                </td>
            </tr>
        </table>
        <table>
            <tr><td colspan="4">Services Details</td></tr>
            <tr>
                <th>Service Name</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Amount</th>
            </tr>
            ${serviceRows}
            <tr>
                <td colspan="3"><strong>Sub Total:</strong></td>
                <td>${formatCurrency(orderTotal.sub_total || 0)}</td>
            </tr>
            <tr>
                <td colspan="3"><strong>Coupon Discount:</strong></td>
                <td>${orderTotal.discount ? '-' + formatCurrency(orderTotal.discount) : formatCurrency(0)}</td>
            </tr>
            <tr>
                <td colspan="3"><strong>Staff Transport Charges:</strong></td>
                <td>${formatCurrency(orderTotal.transport_charges || 0)}</td>
            </tr>
            <tr>
                <td colspan="3"><strong>Staff Charges:</strong></td>
                <td>${formatCurrency(orderTotal.staff_charges || 0)}</td>
            </tr>
            <tr>
                <td colspan="3"><strong>Total:</strong></td>
                <td>${formatCurrency(order.total_amount || 0)}</td>
            </tr>
        </table>
        ${order.order_comment ? `<table><tr><th colspan="4">Order Comment</th></tr><tr><td>${order.order_comment}</td></tr></table>` : ""}
    </main>
</body>
</html>
  `;
}

module.exports = { getOrderDetailsHtml };
