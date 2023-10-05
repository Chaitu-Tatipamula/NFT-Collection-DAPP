// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol" ;
import "@openzeppelin/contracts/access/Ownable.sol" ;
import "./IWhiteList.sol";

contract DEVNft is ERC721Enumerable,Ownable{


    string _baseTokenURI;
    IWhiteList whitelist;
    bool public presaleStarted; 
    uint256 public presaleEnded;
    uint256 public maxTokens = 20;
    uint256 public tokenIds;
    uint256 public _price = 0.01 ether;
    bool public _paused;

    // modifier to pause the minig process in case of any attacks
    modifier onlyWhenNotPaused{
        require(!_paused , "Contract currently paused");
        _;
    }

    constructor(string memory baseURI, address whitelistContractAddress) ERC721("DevsNFT","DNFT") {
        _baseTokenURI = baseURI;
        whitelist = IWhiteList(whitelistContractAddress);
    }
    // start the presale onlyOwner can do it
    function startPresale() public onlyOwner{
        presaleStarted = true; 
        presaleEnded = block.timestamp + 5 minutes;
    }

    function presaleMint() public payable onlyWhenNotPaused(){
        // check if presale started and should end to access public minig
        require(presaleStarted && block.timestamp < presaleEnded,"Presale ended couldn't mint");
        // check if the addres is whitelisted oor not 
        require(whitelist.whitelistedAddress(msg.sender), "You are not Whitelisted to access presale");
        // check for the max tokens limit reached or not 
        require(tokenIds < maxTokens, "Exceeded the maximum supply");
        // check the ETH value sent is valid 
        require(msg.value >= _price, "The fund isn't sufficient should be atleast 0.01 ETH");
        tokenIds++;
        // mine a token
        _safeMint(msg.sender, tokenIds);
    }

    function mint() public payable onlyWhenNotPaused{
        // check if presale started and should end to access public minig
        require(presaleStarted && block.timestamp >= presaleEnded, "Presale isn't closed yet ");
        // check for the max tokens limit reached or not 
        require(tokenIds < maxTokens, "Exceeded the maximum supply");
        // check the ETH value sent is valid 
        require(msg.value >= _price, "The fund isn't sufficient should be atleast 0.01 ETH");
        tokenIds++;
        // mine a token
        _safeMint(msg.sender, tokenIds);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // pause the contract
    function setPaused(bool val) public onlyOwner{
        _paused = val;
    }
    // withdraw all the amount from the contract
    function withdraw() public onlyOwner{
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool _sent, ) = _owner.call{ value : amount}("");
        require(_sent, "Failed to withdraw");
    }

    receive() external payable{}
    fallback() external payable{}
}