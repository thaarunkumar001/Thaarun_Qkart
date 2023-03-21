import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      <CardMedia
         component="img" style={{ height: "200px" }} image={product.image} alt={product.image}
        />
      <CardContent>
      <Typography color="black" variant="h6">{product.name}</Typography>        
      <Typography color="black" variant="h6" style={{fontWeight:'600'}}>${product.cost}</Typography>
      <Rating name="read-only" value={product.rating} readOnly style={{paddingLeft:'10px'}}/>
          <Button variant="contained" className="button" startIcon={<AddShoppingCartOutlined/>} sx={{ width: 1 }}>Add to cart</Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
