import context from "../context/AppContext.js";
import bcrypt from "bcrypt";
import { promisify } from "util";
import { randomBytes } from "crypto";
import { Op } from "sequelize";
import { sendEmail } from "../services/EmailServices.js";
import { isAbsolute } from "path";

export function GetLogin(req, res, next) {
  res.render("auth/login", { "page-title": "Login", layout: "login" });
}

export async function PostLogin(req, res, next) {
  const { Email, Password } = req.body;
  try {
    const user = await context.UserModel.findOne({ where: { email: Email } });
    if (!user) {
      req.flash("errors", "El correo electrónico no está registrado.");
      return res.redirect("/");
    }

    if (!user.isActive) {
      req.flash(
        "errors",
        "El usuario no está activo. Por favor, revise su correo."
      );
      return res.redirect("/");
    }
    const isPasswordValid = await bcrypt.compare(Password, user.password);
    if (!isPasswordValid) {
      req.flash("errors", "Contraseña incorrecta.");
      return res.redirect("/");
    }
    req.session.isAuthenticated = true;
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    req.session.save((error) => {
      if (error) {
        console.error("Error saving session:", error);
        req.flash("errors", "Ocurrió un error al iniciar sesión.");
        return res.redirect("/");
      }
      return res.redirect("/home");
    });
  } catch (error) {
    console.error("Error during login:", error);
    req.flash("errors", "Ocurrió un error al iniciar sesión.");
    return res.redirect("/");
  }
}

export function GetRegister(req, res, next) {
  res.render("auth/register", {
    "page-title": "Register",
    layout: "login",
  });
}

export function Logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) {
      console.error("Error destroying session:", error);
      req.flash("errors", "Ocurrió un error al cerrar sesión.");
      return res.redirect("/home");
    }
    return res.redirect("/");
  });
}

export async function PostRegister(req, res, next) {
  const { Name, Email, Password, ConfirmPassword } = req.body;
  try {
    if (Password !== ConfirmPassword) {
      req.flash("errors", "Las contraseñas no coinciden.");
      return res.redirect("/register");
    }

    const user = await context.UserModel.findOne({ where: { email: Email } });
    if (user) {
      req.flash("errors", "El correo electrónico ya está registrado.");
      return res.redirect("/register");
    }

    const randomBytesAsync = promisify(randomBytes);
    const buffer = await randomBytesAsync(32);
    const token = buffer.toString("hex");

    const hashedPassword = await bcrypt.hash(Password, 10);
    await context.UserModel.create({
      name: Name,
      email: Email,
      password: hashedPassword,
      isActive: false,
      activateToken: token,
    });
    await sendEmail({
      to: Email,
      subject: "Registro exitoso en BookApp",
      html: `
            <h2>¡Felicidades ${Name}!</h2>
            <p>Te has registrado exitosamente en BookApp.</p>
            <p>Para activar tu cuenta, haz clic en el siguiente enlace:</p>
            <p><a href="${process.env.APP_URL}/activate/${token}">Activar cuenta</a></p>
            <p>Si no te registraste, ignora este correo.</p>
          `,
    });

    req.flash("success", "Registro exitoso. Por favor active su cuenta.");
    return res.redirect("/");
  } catch (error) {
    console.error("Error during registration:", error);
    req.flash("errors", "Ocurrió un error al registrar el usuario.");
    return res.redirect("/register");
  }
}

export function GetForgot(req, res, next) {
  res.render("auth/forgot", {
    "page-title": "Forgot Password",
    layout: "login",
  });
}

export async function PostForgot(req, res, next) {
  const { Email } = req.body;

  try {
    const randomBytesAsync = promisify(randomBytes);
    const buffer = await randomBytesAsync(32);
    const token = buffer.toString("hex");
    const user = await context.UserModel.findOne({ where: { email: Email } });
    if (!user) {
      req.flash(
        "errors",
        "No se encontró un usuario con este correo electrónico."
      );
      return res.redirect("/forgot");
    }

    user.resetToken = token;
    user.resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour
    const result = await user.save();

    if (!result) {
      req.flash(
        "errors",
        "Ocurrió un error al guardar el token de restablecimiento."
      );
      return res.redirect("/forgot");
    }
    await sendEmail({
      to: Email,
      subject: "Restablecimiento de contraseña",
      html: `
            <h2>Solicitud de restablecimiento de contraseña de ${user.name}</h2>
            <p>Hemos recibido una solicitud para restablecer su contraseña.</p>
            <p>Haga clic en el siguiente enlace para restablecer su contraseña:</p>
            <p><a href="${process.env.APP_URL}/reset/${token}">Restablecer contraseña</a></p>
            <p>Si no solicitó este cambio, ignore este correo electrónico.</p>
          `,
    });
    req.flash(
      "success",
      "Se ha enviado un enlace de restablecimiento de contraseña a su correo electrónico."
    );
    return res.redirect("/");
  } catch (error) {
    console.error("Error during password reset:", error);
    req.flash(
      "errors",
      "Ocurrió un error al procesar la solicitud de restablecimiento de contraseña."
    );
    return res.redirect("/forgot");
  }
}

export async function GetReset(req, res, next) {
  const token = req.params.token;

  if (!token) {
    req.flash("errors", "Token de restablecimiento no válido.");
    return res.redirect("/forgot");
  }
  try {
    const user = await context.UserModel.findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: {
          [Op.gte]: Date.now(),
        },
      },
    });

    if (!user) {
      req.flash("errors", "Token de restablecimiento no válido o expirado.");
      return res.redirect("/forgot");
    }

    res.render("auth/reset", {
      "page-title": "Reset Password",
      layout: "login",
      userId: user.id,
      token: token,
    });
  } catch (error) {
    console.error("Error fetching reset token:", error);
    req.flash(
      "errors",
      "Ocurrió un error al procesar el token de restablecimiento."
    );
    return res.redirect("/forgot");
  }
}

export async function PostReset(req, res, next) {
  const { userId, token, Password, ConfirmPassword } = req.body;

  try {
    if (Password !== ConfirmPassword) {
      req.flash("errors", "Las contraseñas no coinciden.");
      return res.redirect(`/reset/${token}`);
    }
    const user = await context.UserModel.findOne({
      where: {
        id: userId,
        resetToken: token,
        resetTokenExpiration: {
          [Op.gte]: Date.now(),
        },
      },
    });

    if (!user) {
      req.flash("errors", "Token de restablecimiento no válido o expirado.");
      return res.redirect("/forgot");
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();
    req.flash("success", "Contraseña restablecida exitosamente.");
    return res.redirect("/");
  } catch (error) {
    console.error("Error during password reset:", error);
    req.flash("errors", "Ocurrió un error al restablecer la contraseña.");
    return res.redirect("/forgot");
  }
}

export async function GetActivate(req, res, next) {
  const token = req.params.token;

  if (!token) {
    req.flash("errors", "Token de activación no válido.");
    return res.redirect("/");
  }

  try {
    const user = await context.UserModel.findOne({
      where: { activateToken: token },
    });
    if (!user) {
      req.flash("errors", "Token de activación no válido o expirado.");
      return res.redirect("/");
    }

    user.isActive = true;
    user.activateToken = null;
    user.save();
    req.flash(
      "success",
      "Cuenta activada exitosamente. Ahora puedes iniciar sesión."
    );
    return res.redirect("/");
  } catch (error) {
    console.error("Error fetching activation token:", error);
    req.flash("errors", "Ocurrió un error al procesar el token de activación.");
    return res.redirect("/");
  }
}
