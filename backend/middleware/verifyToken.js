import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.header("auth-token");

    if(!token){
        return res.status(401).json({ message: "Access denied. You need to log in to perform this action." });
    }

    try{
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    }catch (error){
        res.status(400).json({ message: "The token is invalid or has expired."});
    }
};

export const isAdmin = (req, res, next) => {
    if(req.user && (req.user.role === "admin" || req.user.role === "administrador")){
        next();
    }else{
        res.status(403).json({ message: "Access denied. This action requires administrator privileges." });
    }
};
