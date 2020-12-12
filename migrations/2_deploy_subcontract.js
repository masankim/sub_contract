const SubContract = artifacts.require("SubContract");

module.exports = function (deployer) {
  deployer.deploy(SubContract);
};
