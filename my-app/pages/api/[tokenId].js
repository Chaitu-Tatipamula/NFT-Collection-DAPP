// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const tokenId = req.query.tokenId;
  const imageUrl = "https://raw.githubusercontent.com/Chaitu-Tatipamula/NFT-Collection-DAPP/main/my-app/public/cryptodevs/"
  console.log(tokenId);
  res.status(200).json({
    name : "Crypto-Dev NFT #" + tokenId , 
    description : "This is an NFT for Developers in Crypto" ,
    image : imageUrl+tokenId+".svg"
  
  })
}
