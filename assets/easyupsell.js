getUpsell = async (data) => {
  var api_url = getEasyUpsellApiUrl();
  var shopify_product = {};
  var easyupsell_cookie_modal = getCookie("easyupsell_modal");
  if (easyupsell_cookie_modal !== "show_up_to") {
    await jQuery.ajax({
      type: "POST",
      url: api_url + "/shop/upsell/1",
      data: data,
      dataType: "json",
      success: async function (data) {
        var upsell_products = [];

        if (data.upsell.products) {
          await Promise.all(
            data.shopify_products.map(async (item) => {
              var upsell_product = data.upsell.products.filter(
                (p) => item.handle === p.product.handle
              );
              if (upsell_product[0]) {
                shopify_product = item;
                shopify_product.impressionHash = data.upsell.impressionHash;
                shopify_product.upsell_id = data.upsell.id;
                shopify_product.upsell = {
                  discount: upsell_product[0].discount,
                  discount_code: upsell_product[0].discount_code,
                };
                upsell_products.push(shopify_product);
              }
            })
          );
          if (upsell_products.length >= 1) {
            var easyupsell_modal = {
              title: data.upsell.title,
              description: data.upsell.description,
              products: upsell_products,
              addToCartLabel: data.language ? data.language.add_to_cart : null,
              noThanksLabel: data.language ? data.language.no_thanks : null,
              qtyLabel: data.language ? data.language.quantity_text : null,
            };
            createModal(easyupsell_modal);
            showModal();
            const cookie_minutes = data.config
              ? data.config.minutes_threshold
              : 5;
            createCookie("easyupsell_modal", "show_up_to", cookie_minutes);
          }
        }
        return upsell_products;
      },
      error: function (data) {
        return [];
      },
    });
  }
};

getProduct = async (handle) => {
  return await fetch(`/products/${handle}.js`) // Call the fetch function passing the url of the API as a parameter
    .then((response) => response.json())
    .then((product) => {
      return product;
    });
};

storeImpression = async (impression) => {
  const {
    upsell_id,
    productId,
    impressionHash,
    action,
    qty,
    price,
  } = impression;
  var api_url = getEasyUpsellApiUrl();
  var url = api_url + "/impression";
  var data = {
    upsellId: upsell_id,
    product: productId,
    hash: impressionHash,
    action: action,
    quantity: qty,
    price: price,
  };

  await jQuery.ajax({
    type: "POST",
    url: url,
    data: data,
    dataType: "json",
    success: function (data) {
      return true;
    },
  });
};
