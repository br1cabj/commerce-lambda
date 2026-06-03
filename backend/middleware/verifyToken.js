// Imports

import jwt from "jsonwebtoken";

// Exporto al guardia que genera los token

export const verifyToken = (req, res, next) => {
    // Aca se pide la pulsera, normalmente el frontend lo manda por los headers.
    // Se busca un pase llamado "auth-token".
    const token = req.header("auth-token");

    // Si no hay nada, se niega el acceso.
    if(!token){
        return res.status(401).json({ message: "¡Acceso denegado! Necesitas iniciar sesión para hacer esto." });
    }

    try{
        // Si hay uun token, aca uso mi tokensecret para verificar.
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // Si se verifica, uso los datos del usuario(id y role) y se lo paso a mi req para que en las siguientes acciones se sepa quien esta ejecutando una accion.
        req.user = verified;

        // Aca uso el next() que lo que hace es darle la orden al codigo que todo esta bien y que continue con las funciones.
        next();
    }catch (error){
        // Si el token es inventado o ya caducó(1 dia)
        res.status(400).json({ message: "El token no es válido o ya caducó. "});
    }
};

// Guardia que verá los roles de las cuentas.

export const isAdmin = (req, res, next) => {
    // Aca verificamos el rol del usuario que ya está verificado para ver si es admin o client.
    if(req.user && req.user.role === "admin"){
        // Si el rol dice admin, lo dejo hacer sus acciones.
        next();
    }else{
        // Si dice clien o no hay nada, le doy un error 403(prohibido.)
        res.status(403).json({ message: "¡Alto ahí! Esta acción es exclusiva de los dueños de Onda Basquete." });
    }
};