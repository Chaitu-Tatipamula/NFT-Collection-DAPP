const hre = require('hardhat')
const {WHITELIST_CONTRACT_ADDRESS,METADATA_URL} = require('../constants');


async function sleep(ms){
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main(){

  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  const metadata = METADATA_URL
  const deployedContract = await hre.ethers.deployContract("DEVNft",[
    metadata,
    whitelistContract]
  )
  await deployedContract.waitForDeployment();

  console.log("DevNft Contract address", deployedContract.target);

  await sleep(30 * 1000)

  await hre.run("verify:verify", {
    address: deployedContract.target,
    constructorArguments: [metadata,whitelistContract],
  });

}

main()
.then(()=>process.exit(0))
.catch((error)=>{
  console.log(error);
  process.exit(1)
})