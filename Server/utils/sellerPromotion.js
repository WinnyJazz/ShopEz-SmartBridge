const SellerApplication = require("../models/SellerApplication");

// Kalau aplikasi sudah di-approve lewat MongoDB, naikkan role user jadi seller.
async function promoteIfApproved(user) {
  if (user.role === "seller") return false;

  const approved = await SellerApplication.findOne({
    user: user._id,
    status: "approved",
  });

  if (!approved) return false;

  user.role = "seller";
  if (!user.shopName) user.shopName = approved.shopName;
  if (!user.shopDescription) user.shopDescription = approved.shopDescription;

  await user.save();
  return true;
}

module.exports = { promoteIfApproved };