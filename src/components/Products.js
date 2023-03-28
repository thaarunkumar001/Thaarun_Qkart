
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  import { Search, SentimentDissatisfied } from "@mui/icons-material";
  import {
    CircularProgress,
    Grid,
    InputAdornment,
    TextField,
  } from "@mui/material";
  import { Box } from "@mui/system";
  import axios from "axios";
  import { useSnackbar } from "notistack";
  import React, { useEffect, useState } from "react";
  import { config } from "../App";
  import Footer from "./Footer";
  import Header from "./Header";
  import ProductCard from "./ProductCard"
  import "./Products.css";
  import Cart,{generateCartItemsFrom} from "./Cart"
  // Definition of Data Structures used/** * @typedef {Object} Product - Data on product available to buy *  * @property {string} name - The name or title of the product * @property {string} category - The category that the product belongs to * @property {number} cost - The price to buy the product * @property {number} rating - The aggregate rating of the product (integer out of five) * @property {string} image - Contains URL for the product image * @property {string} _id - Unique ID for the product */ 
  const Products = () => {
    // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it  /**   * Make API call to get the products list and store it to display the products   *   * @returns { Array.<Product> }   *      Array of objects with complete data on all available products   *   * API endpoint - "GET /products"   *   * Example for successful response from backend:   * HTTP 200   * [   *      {   *          "name": "iPhone XR",   *          "category": "Phones",   *          "cost": 100,   *          "rating": 4,   *          "image": "https://i.imgur.com/lulqWzW.jpg",   *          "_id": "v4sLtEcMpzabRyfx"   *      },   *      {   *          "name": "Basketball",   *          "category": "Sports",   *          "cost": 100,   *          "rating": 5,   *          "image": "https://i.imgur.com/lulqWzW.jpg",   *          "_id": "upLK9JbQ4rMhTwt4"   *      }   * ]   *   * Example for failed response from backend:   * HTTP 500   * {   *      "success": false,   *      "message": "Something went wrong. Check the backend console for more details"   * }   */   
    const [products, setProducts] = useState([]);
    let token=localStorage.getItem("token");
    let username=localStorage.getItem("username");
  let balance=localStorage.getItem("balance");
     const [filteredProducts, setFilteredProducts] = useState([]);
     const [loading, setLoading] = useState(false);
     const [searchText, setSearchText] = useState("");
     const [debounceTimeout, setDebounceTimeout] = useState(null);
     const { enqueueSnackbar } = useSnackbar();
     const [cartItems,setCartItems]=useState([]);
     const [cartLoad,setCartLoad]=useState(null)

     // Make API call to get the products list and store it to display the products  
     const performAPICall = async () => {
      setLoading(true);
      try{
        await axios.get(`${config.endpoint}/products`).then((response)=>{
          setProducts(response.data);
          setCartLoad(true)
        }).catch((error)=>{
          enqueueSnackbar(error.response.data.message, { variant: "error" });
        })
      }
      catch (error) {
        enqueueSnackbar("Something went wrong. Check that the backend is running, reachable and returns valid JSON.", { variant: "error" });
        }
        setLoading(false);
      };
    useEffect(() => {
      performAPICall();
    },[]);
    useEffect(()=>{fetchCart(token)},[cartLoad])
    // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic  /**   * Definition for search handler   * This is the function that is called on adding new search keys   *   * @param {string} text   *    Text user types in the search bar. To filter the displayed products based on this text.   *   * @returns { Array.<Product> }   *      Array of objects with complete data on filtered set of products   *   * API endpoint - "GET /products/search?value=<search-query>"   *   */  
    const performSearch = async (text) => {
      try {
        const response = await axios.get(
          `${config.endpoint}/products/search?value=${text}`      );
        setFilteredProducts(response.data);
      } catch (error) {
        console.error(error);
        setFilteredProducts(null);
        enqueueSnackbar(error.message, {
          variant: "error",
        });
      }
    };
    // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation  /**   * Definition for debounce handler   * With debounce, this is the function to be called whenever the user types text in the searchbar field   *   * @param {{ target: { value: string } }} event   *    JS event object emitted from the search input field   *   * @param {NodeJS.Timeout} debounceTimeout   *    Timer id set for the previous debounce call   *   */  
const debounceSearch = (event, debounceTimeout) => {
      clearTimeout(debounceTimeout);
      const value = event.target.value;
      setSearchText(value);
      const newDebounceTimeout = setTimeout(() => {
        performSearch(value);
      }, 500);
      return newDebounceTimeout;
    };

    const handleSearch = (event) => {
      const newDebounceTimeout = debounceSearch(event, debounceTimeout);
      setDebounceTimeout(newDebounceTimeout);
    };

    const fetchCart = async (token) => {
      if (!token) return;
  
      try {
        // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
        const response=await axios.get(`${config.endpoint}/cart`,
      {
        headers:{
        Authorization:`Bearer ${token}`,
        }
      })
      if(response.status===200){
        setCartItems(generateCartItemsFrom(response.data,products));
      }
      } catch (e) {
        if (e.response && e.response.status === 400) {
          enqueueSnackbar(e.response.data.message, { variant: "error" });
        } else {
          enqueueSnackbar(
            "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
            {
              variant: "error",
            }
          );
        }
        return null;
      }
    };
    const isItemInCart = (items, productId) => {
      let isItem=false;
      items.forEach((item)=>{
        if(item._id==productId) 
        isItem=true;
      });
      return isItem;
      }
    
  
    const addToCart = async (
      token,
      items,
      products,
      productId,
      qty,
      options = { preventDuplicate: false }
    ) => {
      if (token) {
        if (!isItemInCart(items, productId)) {
          addInCart(productId, qty);
        } else {
          enqueueSnackbar(
            "Item already in cart. Use the cart sidebar to update quantity or remove item.",
            {
              variant: "warning",
            }
          );
        }
      } else {
        enqueueSnackbar("Login to add an item to the Cart", {
          variant: "warning",
        });
      }
    };

    let addInCart = async (productId, qty) => {
      try {
        let response = await axios.post(
          `${config.endpoint}/cart`,
          {
            productId: productId,
            qty: qty,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        //Update cartItems      
        setCartItems(generateCartItemsFrom(response.data, products));
      } catch (e) {
        if (e.response && e.response.status === 400) {
          enqueueSnackbar(e.response.data.message, { variant: "error" });
        } else {
          enqueueSnackbar("Could not add to cart. Something went wrong.", {
            variant: "error",
          });
        }
      }
    };

    let handleCart = (productId) => {
      addToCart(token, cartItems, products, productId, 1);
    };
    let handleQuantity = (productId, qty) => {
      addInCart(productId, qty);
    };

  return (
    <div>       
      <Header>        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField        
        className="search-desktop"       
         size="small"        
         fullWidth        
         InputProps={{
          endAdornment: (
            <InputAdornment position="end">              
            <Search color="primary" />            
            </InputAdornment>          
            ),
        }}
        placeholder="Search for items/categories"        
        name="search"        
        value={searchText}
        onChange={handleSearch}
      />       
      </Header>       {/* Search view for mobiles */}
     <TextField        
     className="search-mobile"        
     size="small"        
     fullWidth        
     InputProps={{
          endAdornment: (
            <InputAdornment position="end">              
            <Search color="primary" />            
            </InputAdornment>          ),
        }}
        placeholder="Search for items/categories"        
        name="search"        
        value={searchText}
        onChange={handleSearch}
      />
      <Grid container>
      <Grid item key={1} xs={12} md={username?8:12} className="product-grid"> 
      <Grid>         
       <Box className="hero">            
        <p className="hero-heading">
          India's <span className="hero-highlight">FASTEST DELIVERY</span>to your door step</p>           
          </Box>         
          </Grid>         
          {loading ? (
          <Box style={{display: 'flex', flexDirection:"column",justifyContent:'center',alignItems:'center', width: "100%", height: "300px"}}>         
           <CircularProgress/>           
           <p>Loading Products</p>           
           </Box>         ): 
           ( debounceTimeout==null ? (
          <Grid container spacing={2} my={3}>    
           {
                  products.map((product)=>{
                    return(
                    <Grid item key={product["_id"]} xs={6} md={3}>                     
                    <ProductCard  product={product}
                    handleAddToCart={(event)=>handleCart(product["_id"])}
                    />                    
                    </Grid>                    
                    )
                  })
                }
              </Grid>
              ):
              (filteredProducts?              
                (<Grid container spacing={2} my={3}>           
                {
                  filteredProducts.map((product)=>{
                    return(
                    <Grid item key={product["_id"]} xs={6} md={3}>                     
                    <ProductCard product={product} 
                    handleAddToCart={(event)=>handleCart(product["_id"])}/>                    
                    </Grid>                    
                    )
                  })
                }
              </Grid> ):
              (
                <Box style={{display: 'flex', flexDirection:"column",justifyContent:'center',alignItems:'center', width: "100%", height: "300px"}}>                 
                <SentimentDissatisfied />                 
                <h3>No products found</h3>                
                </Box>                 
                )
         ))}
         </Grid>
         {username && <Grid item sx={{backgroundColor:"#E9F5E1", display: username !== "" ? "block" : "none"}}  xs={12} md={4}  >              
         <Cart              
         items={cartItems}
              products={products}
              handleQuantity={handleQuantity}
            /></Grid>} 
         </Grid>
       <br/>      
       <Footer />    
      </div>
);
};
export default Products;