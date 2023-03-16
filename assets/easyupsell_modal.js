const createSelect = (options) => {
  const select = document.createElement("select");

  select.classList.add("select-elem");

  select.innerHTML = options
    .map(
      (option) =>
        `<option data-id="${option.id}" data-product_id="${option.product_id}" data-price="${option.price}" data-sku="${option.sku}" value="${option.title}">${option.title}</option>`
    )
    .join("");

  return select;
};

const createModal = (easyupsell_modal) => {
  const title = easyupsell_modal.title;
  const description = easyupsell_modal.description;
  const products = easyupsell_modal.products;
  const noThanksLabel = easyupsell_modal.noThanksLabel
    ? easyupsell_modal.noThanksLabel
    : "No thanks!";
  const addToCartLabel = easyupsell_modal.addToCartLabel
    ? easyupsell_modal.addToCartLabel
    : "Add to cart";
  const qtyLabel = easyupsell_modal.qtyLabel
    ? easyupsell_modal.qtyLabel
    : "Qty:";

  const script = document.createElement("script");
  script.src = "https://code.jquery.com/jquery-3.4.1.min.js";
  script.type = "text/javascript";
  document.getElementsByTagName("head")[0].appendChild(script);

  const body = $("body");
  var product_list = "";
  products.forEach((element) => {
    product_list +=
      '<div class="easyupsell-modal-product-container"><h3 class="easyupsell-modal-product-title"><a href=".' +
      element.url +
      '">' +
      element.title +
      "</a></h3>";
    if (element.image) {
      product_list +=
        '<img class="easyupsell-modal-product-image" src="' +
        element.image.src +
        '" />';
    }

    
      const elem_selec = createSelect(element.variants);
      product_list += `<div class="options-select-wrapper">${(element.variants.length > 1) ? elem_selec.outerHTML : ""}</div>`;
    

    if (element.variants[0]) {
      product_list +=
        '<p class="easyupsell-modal-product-price" id="easyupsell-product-price-' +
        element.variants[0].id +
        '" >$' +
        element.variants[0].price +
        "</p>";
    }
    let tmp_discount = 0;
    if (element.discount) {
      tmp_discount = element.discount;
      product_list +=
        '<span class="easyupsell-modal-product-discount" id="easyupsell-product-discount-' +
        element.discount +
        '" > -%' +
        element.discount +
        ' OFF</span><span class="easyupsell-modal-product-discode" id="easyupsell-product-discode-' +
        element.variants[0].id +
        '" style="display: none!important;">' +
        element.discount_code +
        "</span>";
    }
    product_list +=
      '<p><label for="fname">' +
      qtyLabel +
      '</label><input type="number" min="0" step="1" class="easyupsell-modal-product-qty" id="easyupsell-product-' +
      element.variants[0].id +
      '" name="easyupsell-product-' +
      element.variants[0].id +
      '"></p><p><a class="add-to-cart add-cart-btn" href="#" data-price="' +
      element.variants[0].price +
      '" data-discount="' +
      tmp_discount +
      '" data-impressionHash="' +
      element.impressionHash +
      '" data-upsell_id="' +
      element.upsell_id +
      '" data-id="' +
      element.id +
      '" data-variant="' +
      element.variants[0].id +
      '" >' +
      addToCartLabel +
      "</a></p>";
    product_list += "</div>";
    return product_list;
  });
  const modal = $(
    `
    <div id="myModal" class="modal">

      <div class="modal-content">
        <span class="close" onclick="closeModal();">&times;</span>
        <h1 class="easyupsell-modal-title">` +
      title +
      `</h1>
        <p class="easyupsell-modal-excerpt">` +
      description +
      `</p>

        <div>` +
      product_list +
      `</div>
        <span class="easyupsell-modal-footer-close" onclick="closeModal();">` +
      noThanksLabel +
      `</span>
      </div>
    </div>
    <script>

$('.select-elem').change(function(e){
    currentSelected = $(e.currentTarget).find(':selected').data('id')
    
    
    // add-cart-btn
    $(e.currentTarget).parent().parent().find('.easyupsell-modal-product-price').text('$ ' + $(e.currentTarget).find(':selected').data('price'))
    $(e.currentTarget).parent().parent().find('.add-cart-btn').data('variant', $(e.currentTarget).find(':selected').data('id'))
    $(e.currentTarget).parent().parent().find('.add-cart-btn').data('price', $(e.currentTarget).find(':selected').data('price'))
  })

  $('.add-cart-btn').click(function() {
  let currentElementVariant = jQuery(this)
  let upsell_id = currentElementVariant.data('upsell_id')
  let variantId = currentElementVariant.data('variant')
  let productId = currentElementVariant.data('id')
  let impressionHash = currentElementVariant.data('impressionhash')
  let price = currentElementVariant.data('price')
  let discount = currentElementVariant.data('discount')
  let q = currentElementVariant.parent().parent().find('.easyupsell-modal-product-qty').val()
  addToCart(upsell_id, variantId, productId, impressionHash, price, discount, q)
  
  })
    </script>
    `
  ).css({});

  body.append(modal);
};
const showModal = () =>
  (document.querySelector("#myModal").style.display = "block");
const closeModal = () =>
  (document.querySelector("#myModal").style.display = "none");

const addToCart = async (
  upsell_id,
  variantId,
  productId,
  impressionHash,
  price = false,
  discount = false,
  q = false
) => {
  var item = "#easyupsell-product-" + variantId;
  var item_price = "#easyupsell-product-price-" + variantId;
  var item_discount = discount
    ? discount
    : "#easyupsell-product-discode-" + variantId;
  var price = price ? price : jQuery(item_price).text();
  var qty = q ? q : jQuery(item).val();
  var discount_code = jQuery(item_discount).text();

  if (!qty) {
    qty = 1;
  }
  await jQuery
    .post("/cart/add.js", {
      items: [
        {
          quantity: qty,
          id: variantId,
        },
      ],
    })
    .then((result) => {
      var impression = {
        upsell_id: upsell_id,
        productId: productId,
        impressionHash: impressionHash,
        action: "addToCart",
        qty: qty,
        price: price.toString().replace("$", ""),
      };
      if (discount_code) {
        applyDiscount(discount_code);
      }

      storeImpression(impression);
      window.location.reload();
    });
};

const applyDiscount = async (discount_code) => {
  //  Setup the Apply Discount Code URL
  let shopDomain = "josebianco.myshopify.com";
  let discountApplyUrl = "https://" + shopDomain + "/discount/" + discount_code;

  // Applies discount using hidden iframe to the checkout session
  let i = document.createElement("iframe");
  i.style.display = "none";
  i.onload = function () {
    i.parentNode.removeChild(i);
  };
  i.src = discountApplyUrl;
  document.body.appendChild(i);
};
