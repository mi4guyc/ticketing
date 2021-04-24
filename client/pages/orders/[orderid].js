import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

// Stripe API Test Creds
// Secret: sk_test_51Iig76J1UEE1Z8UcGqeZThyVXNy1VPv8nSAqiaiyzEp6LqoS2zxmxHwlwjjgcalh75K3sgcYhQGE81IMVkrb2laz00KuNEkoxP
// Publishable: pk_test_51Iig76J1UEE1Z8UcCaG5zvNt1OvHYFi9b1aIUnvVjTNYnYtEKO1elpam6rsZaORVWSixZeRJqiGKz974Ez24JzKR00mEJHTnuj

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => Router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    // Invoke before timer starts
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    // On Exit
    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <div>Time to pay has expired</div>;
  }
  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey={
          "pk_test_51Iig76J1UEE1Z8UcCaG5zvNt1OvHYFi9b1aIUnvVjTNYnYtEKO1elpam6rsZaORVWSixZeRJqiGKz974Ez24JzKR00mEJHTnuj"
        }
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  //trailing url path [orderid]
  const { orderid } = context.query;
  // console.log(context.query);
  // get the order details from the service
  const { data } = await client.get(`/api/orders/${orderid}`);
  console.log(data);
  return { order: data };
};
export default OrderShow;
