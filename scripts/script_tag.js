var oldXHR = window.XMLHttpRequest;

function newXHR() {
  var realXHR = new oldXHR();
  realXHR.addEventListener(
    "load",
    function () {
      if (realXHR.readyState == 4 && realXHR.status == 200) {
          const response = JSON.parse(realXHR.response)
        if (realXHR._url === "/cart/add.js" || realXHR._url === "/cart/change.js") {
          fetch("http://dd017a0603de.ngrok.io/cart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              shop: Shopify.shop,
              ecommerce: 'shopify',
              end_point: realXHR._url,
              customer_id: customerid,
              customer_phone: customerphone,
              response: response
            }),
          });
        }
      }
    },
    false
  );
  return realXHR;
}
window.XMLHttpRequest = newXHR;

// for (let i = 0; i < document.querySelectorAll("form").length; i++) {
//   if (document.querySelectorAll("form")[i].action.includes("/cart/add")) {
//     document
//       .querySelectorAll("form")
//       [i].addEventListener("submit", function () {
//         console.log({
//           customerid: customerid,
//           customerphone: customerphone,
//           productid: productid,
//         });
//         fetch("http://dd017a0603de.ngrok.io/test", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             customerid: customerid,
//             customerphone: customerphone,
//             productid: productid,
//           }),
//         });
//       });
//   }
// }
