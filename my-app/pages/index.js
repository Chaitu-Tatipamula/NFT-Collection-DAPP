import { ethers } from "ethers";
import Head from "next/head";
import { useEffect, useRef, useState } from "react"
import Web3Modal, { providers } from 'web3modal';
import styles from '@/styles/Home.module.css'
import {NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS} from "../constants/index"

export default function Home() {
  // state variable to keep track of wallet connection
  const [walletConnected,setWalletConnected] = useState(false);
  // state variable to keep track of current addressis owner or not  
  const [isOwner, setIsOwner] = useState(false)
  // state variable to keep track of whether the presale started or not 
  const [presaleStarted, setPresaleStarted] = useState(false);
  // state variable to keep track of whether the presale ended or not 
  const [presaleEnded, setPresaleEnded] = useState(false);
  // state variable to keep track of number of tokens minted 
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0")
  // state variable to keep track of contract pausing state
  const [paused, setPaused] = useState(false) 

  const [loading, setLoading] = useState(false)

  // create a ref to persist for the full life time of the browser plugin
  const web3ModalRef = useRef();

    // function to grab the provider or the signer when needed
    const getProviderOrSigner = async(needSigner=false)=>{
      
      try {
            // connect to the present reference that is connected in Metamask
            const provider = await web3ModalRef.current.connect()
            // now grab the provider from the above instance
            const web3Provider =new ethers.BrowserProvider(provider);
            // check if wallet is in sepolia testnet 
            const {chainId} = await web3Provider.getNetwork()
            if(chainId != "11155111"){
              window.alert("Change the network to Sepolia testnet");
              throw new Error("Change the network")
            }

            // if you need a signer 
            if(needSigner){
              // grab the signer from the provider instance
              const signer =await web3Provider.getSigner();
              return signer;
            }
            return web3Provider;
          
        } catch (err) {
          console.error(err.message);
        }

      }
    // function to start the presale from the contract
    const startPresale = async() =>{
      setLoading(true)
      try {
          // grab the signer 
          const signer = await getProviderOrSigner(true)
          // create the contract instance
          const nftContract = new ethers.Contract(
            NFT_CONTRACT_ADDRESS,
            NFT_CONTRACT_ABI,
            signer
          )
          // carryout the transaction by calling from the contract 
          const transaction = await nftContract.startPresale();
          setLoading(true);
          // wait for the transaction to complete on metamask
          await transaction.wait();
          setLoading(false);
          await checkPresaleStarted();
      } catch (err) {
        console.error(err.message);
      }
      setLoading(false)
    }
    // function to check if the presale started 
    const checkPresaleStarted = async() =>{

      try {
        // grab the provider
        const provider = await getProviderOrSigner();
        // creata contract instance 
        const nftContract = new ethers.Contract(
          NFT_CONTRACT_ADDRESS,
          NFT_CONTRACT_ABI,
          provider
        )
        // know the value from the contract 
        const _presaleStarted = await nftContract.presaleStarted();
        // when the sale hasn't started check if connected to owner account
        if(!_presaleStarted){
          await getOwner();
        }
        // set the state variable
        await setPresaleStarted(_presaleStarted)
        // console.log(presaleStarted);
        return _presaleStarted
      } catch (err) {
        console.error(err.message);
        return false
      }

    }
    // function to check if the presale ended 
    const checkPresaleEnded = async() => {
      try {
        // grab the provider
        const provider = await getProviderOrSigner();
        // create the contract instance 
        const nftContract = new ethers.Contract(
          NFT_CONTRACT_ADDRESS,
          NFT_CONTRACT_ABI,
          provider
        )
        // know the value from the contract
        const _presaleEnded = await nftContract.presaleEnded();
        // compare if the current time is greater than the block timestamp when sale ended
        const hasEnded = _presaleEnded < Math.floor(Date.now()/1000)
        // set the state variables 
        if(hasEnded){
          setPresaleEnded(true)
        }else{
          setPresaleEnded(false)
        }
      // console.log(presaleEnded);
        return hasEnded;
        
      } catch (err) {
        console.error(err.message);
        return false
      }
    }
    // function to access public mint from contract
    const publicMint = async()=>{
      setLoading(true)
      try {
        // grab the sogner
        const signer = await getProviderOrSigner(true)
        // create the contract instance 
          const nftContract = new ethers.Contract(
            NFT_CONTRACT_ADDRESS,
            NFT_CONTRACT_ABI,
            signer
          )
          // carryout the transaction 
          const transaction = await nftContract.mint({
            value : ethers.parseEther("0.01")
          });
          setLoading(true);
          // wait for the transaction to complete
          await transaction.wait();
          setLoading(false);
          window.alert("Successfully minted a Dev-Nft")
          
      } catch (err) {
        console.error(err.message);
      }
      setLoading(false)
    }
    // function to access presale mint from the contract
    const presaleMint = async()=>{
      setLoading(true)
      try {
        // grab the signer 
        const signer = await getProviderOrSigner(true)
        // create a contract instance 
          const nftContract = new ethers.Contract(
            NFT_CONTRACT_ADDRESS,
            NFT_CONTRACT_ABI,
            signer
          )
          // carryout the transaction
          const transaction = await nftContract.presaleMint({
            value : ethers.parseEther("0.01")
          });
          setLoading(true);
          // wait for it to complete
          await transaction.wait();
          setLoading(false);
          window.alert("Successfully minted a Dev-Nft")
          
      } catch (err) {
        console.error(err.message);
      }
      setLoading(false)
    }
    // function to know if Dapp connected to owner of contract
    const getOwner = async()=>{

      try {
        // grab the signer
          const signer = await getProviderOrSigner(true);
          // create the contract instance
          const nftContract = new ethers.Contract(
            NFT_CONTRACT_ADDRESS,
            NFT_CONTRACT_ABI,
            signer
          )
          // get the current signer's address
          const userAddress = await signer.getAddress();
          // get the address of the contract deployer(owner)
          const contractOwner =await nftContract.owner();
          // check if both addresses are same 
          let ownerOrNot;
          if(userAddress == contractOwner){
             ownerOrNot = true;
            // set the statevariable
            await setIsOwner(true)
          }
          else{
            ownerOrNot = false;
            // set the statevariable
            await setIsOwner(false)
          }
          return ownerOrNot;
      } catch (err) {
        console.error(err.message);
      }
    }
    // to know the number of NFT's minted till now
    const numOfTokensMinted = async()=>{
      try {
        // grab the provider
        const provider = await getProviderOrSigner();
        // create the contract instance
        const nftContract = new ethers.Contract(
          NFT_CONTRACT_ADDRESS,
          NFT_CONTRACT_ABI,
          provider
        )
        // access the tokenId from the contracts state variable
        const _tokenIds = await nftContract.tokenIds()
        // set the state variable
        setTokenIdsMinted(_tokenIds.toString())
      } catch (error) {
        console.error(error);
      }
    }

    const pauseMining = async()=>{
      setLoading(true)
      try {
        // grab the provider
        const signer = await getProviderOrSigner(true);
        // create the contract instance
        const nftContract = new ethers.Contract(
          NFT_CONTRACT_ADDRESS,
          NFT_CONTRACT_ABI,
          signer
        )
        // access the pause function from the contract
        const transaction = await nftContract.setPaused(true);
        await transaction.wait()
        // set the state variable
        setPaused(true);
      } catch (error) {
        console.error(error);
      }
      setLoading(false)

    }

    const resumeMining = async()=>{
      setLoading(true)
      try {
        // grab the provider
        const signer = await getProviderOrSigner(true);
        // create the contract instance
        const nftContract = new ethers.Contract(
          NFT_CONTRACT_ADDRESS,
          NFT_CONTRACT_ABI,
          signer
        )
        // access the pause function from the contract
        const transaction = await nftContract.setPaused(false);
        await transaction.wait()
        // set the state variable
        setPaused(false);
      } catch (error) {
        console.error(error);
      }
      setLoading(false)

    }
    // to get funds from the contract
    const withdrawAmount = async()=>{
      setLoading(true)
      try {
        // grab the provider
        const signer = await getProviderOrSigner(true);
        // create the contract instance
        const nftContract = new ethers.Contract(
          NFT_CONTRACT_ADDRESS,
          NFT_CONTRACT_ABI,
          signer
        )
        // access the withdraw function from the contract
        const transaction = await nftContract.withdraw();
        await transaction.wait()
        
      } catch (error) {
        console.error(error);
      }
      setLoading(false)
    }

    const connectWallet = async() => {
        try {
          
          await getProviderOrSigner(true);
          setWalletConnected(true);

        } catch (error) {
          console.log(error);
        }
    }

    
    // gotta do some thing on page loading
    const onPageLoads = async() =>{
      // connect to wallet
      await connectWallet();
      // get the owner
      await getOwner()
      // check for the number of tokens minted for every 5 seconds
      setInterval(async()=>{
        await numOfTokensMinted();
      },5*100)

      // check for the presale sart and end status every 0.1 seconds
      setInterval(async()=>{
        const _presaleStarted = await checkPresaleStarted();
        if(_presaleStarted){
          await checkPresaleEnded();
        }
      },3*100)
    }
    

    useEffect(()=>{
      if(!walletConnected){
        web3ModalRef.current = new Web3Modal({
          network : "sepolia",
          providerOptions : {},
          disableInjectedProvider : false ,
        })
        onPageLoads();
      }

    },[walletConnected])


    const renderButton = ()=>{
      // render a button to connect to wallet if not connected
      if(!walletConnected){
       return (
        <button onClick={connectWallet} className={styles.button} >
        Connect to Wallet 
       </button>
       )
      }
      // a place where it can show loading status when something is carrying out
      if(loading){
        return (
          <div className={styles.description}>
              loading...
          </div>
        )
      }
      // Let the owner start the presale if it isn't
      if(isOwner  ){
        return (
          <div>
              {!presaleStarted || presaleEnded?
              <div>
                  <div className={styles.description}>
                     Presale Ended Start again..!
                  </div>
                 <button className={styles.ownerButton} onClick={startPresale}>
                    Start Presale 🏁
                  </button>
                </div>:null}            
               
          <div>
            <button className={styles.ownerButton} onClick={pauseMining}>
              Pause Mining. ⏸️
            </button>
            </div>
            <div>
            <button className={styles.ownerButton} onClick={resumeMining}>
              Resume Mining. ▶️
            </button>
            </div>
            <div>
            <button className={styles.ownerButton} onClick={withdrawAmount}>
                Withdraw amount 💳
            </button>
            </div>
            
          </div>
        )
      }
      
      // Let whitelisted users mine a single NFT in presale 
      if( presaleStarted && !presaleEnded){
        return (
          <>
              <div className={styles.description} >
                Presale has started you can mine if your'e Whitelisted 😎
              </div>
              <button className={styles.button} onClick={presaleMint}>
                Presale Mint ⛏️
              </button>
          </>
          )
        
      }
  
      // Let users mine a single NFT after presale
       if(presaleStarted && presaleEnded && !isOwner){
        return (
          <>
              <div className={styles.description} >
                Presale has ended and you can mine if any remain..! 😀
              </div>
              <button className={styles.button} onClick={publicMint}>
                Public Mint ⛏️
              </button>
          </>
          )
        
      }
      // show a message for users when nothing is done
      if(!isOwner&&!presaleStarted&&!presaleEnded){
      return (
            <div className={styles.description}>
              Presale not Started wait for it to take place..!
            </div>
        )
      }
      
     
  }

  return (
    <>
        <Head>
          <title>NFT Collection</title>
          <meta name="DAPP" content="NFT-Collection" ></meta>
        </Head>
        <div className={styles.main}>
          <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
             this is a Nft-Collection for devs in Crypto
           </div>
          <div className={styles.description}>
          {tokenIdsMinted}/20 have already minted till now 
           </div>
           {renderButton()}
          </div>    
          <div> 
              <img className={styles.image} src='.\cryptodevs\0.svg' />
          </div>   
      </div>
      <div className={styles.footer}>
            Made by someOne with
      </div>
    </>
  )
}