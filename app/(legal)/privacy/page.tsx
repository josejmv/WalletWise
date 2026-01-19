import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de Privacidad | WalletWise",
  description:
    "Politica de privacidad de WalletWise. Conoce como recopilamos, usamos y protegemos tu informacion personal.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Politica de Privacidad</h1>

      <p className="lead">
        Ultima actualizacion: {new Date().toLocaleDateString("es-VE")}
      </p>

      <p>
        En WalletWise, nos comprometemos a proteger tu privacidad y tus datos
        personales. Esta Politica de Privacidad describe como recopilamos,
        usamos, almacenamos y protegemos tu informacion cuando utilizas nuestra
        aplicacion de gestion financiera personal.
      </p>

      <p>
        Al utilizar WalletWise, aceptas las practicas descritas en esta
        politica. Si no estas de acuerdo con alguna parte de esta politica, te
        recomendamos no utilizar nuestros servicios.
      </p>

      <h2>1. Responsable del Tratamiento de Datos</h2>

      <p>
        WalletWise es una aplicacion de gestion financiera personal desarrollada
        y mantenida de forma independiente. Para cualquier consulta relacionada
        con esta politica de privacidad o el tratamiento de tus datos
        personales, puedes contactarnos a traves de los medios indicados en la
        seccion de contacto al final de este documento.
      </p>

      <h2>2. Datos Personales que Recopilamos</h2>

      <h3>2.1. Datos proporcionados directamente por el usuario</h3>

      <ul>
        <li>
          <strong>Datos de registro:</strong> Direccion de correo electronico,
          nombre (opcional), y contrasena encriptada.
        </li>
        <li>
          <strong>Datos de autenticacion:</strong> Credenciales de inicio de
          sesion, tokens de sesion, y datos de autenticacion biometrica
          (WebAuthn/Passkeys) si decides habilitarla.
        </li>
        <li>
          <strong>Datos financieros:</strong> Informacion sobre tus cuentas,
          ingresos, gastos, transferencias, presupuestos, categorias e
          inventario que registres en la aplicacion. Estos datos son encriptados
          de extremo a extremo (E2E) antes de ser almacenados.
        </li>
        <li>
          <strong>Preferencias de usuario:</strong> Configuracion de la
          aplicacion, moneda predeterminada, y preferencias de visualizacion.
        </li>
      </ul>

      <h3>2.2. Datos recopilados automaticamente</h3>

      <ul>
        <li>
          <strong>Datos tecnicos:</strong> Tipo de navegador, sistema operativo,
          direccion IP, identificadores de dispositivo, y datos de conexion.
        </li>
        <li>
          <strong>Datos de uso:</strong> Paginas visitadas dentro de la
          aplicacion, funciones utilizadas, fecha y hora de acceso, y duracion
          de las sesiones.
        </li>
        <li>
          <strong>Cookies y tecnologias similares:</strong> Utilizamos cookies
          esenciales para el funcionamiento de la aplicacion y la gestion de
          sesiones. Consulta la seccion 7 para mas detalles.
        </li>
      </ul>

      <h2>3. Finalidad del Tratamiento de Datos</h2>

      <p>Utilizamos tus datos personales para los siguientes fines:</p>

      <ul>
        <li>
          <strong>Prestacion del servicio:</strong> Permitirte registrar,
          gestionar y analizar tu informacion financiera personal.
        </li>
        <li>
          <strong>Autenticacion y seguridad:</strong> Verificar tu identidad,
          proteger tu cuenta contra accesos no autorizados, y garantizar la
          seguridad de la plataforma.
        </li>
        <li>
          <strong>Mejora del servicio:</strong> Analizar patrones de uso
          anonimizados para mejorar la funcionalidad y experiencia de usuario.
        </li>
        <li>
          <strong>Comunicaciones:</strong> Enviarte notificaciones relacionadas
          con tu cuenta, alertas de seguridad, y actualizaciones importantes del
          servicio.
        </li>
        <li>
          <strong>Cumplimiento legal:</strong> Cumplir con obligaciones legales
          aplicables y responder a solicitudes de autoridades competentes cuando
          sea legalmente requerido.
        </li>
      </ul>

      <h2>4. Base Legal para el Tratamiento</h2>

      <p>
        El tratamiento de tus datos personales se fundamenta en las siguientes
        bases legales, de conformidad con la legislacion venezolana aplicable:
      </p>

      <ul>
        <li>
          <strong>Ejecucion de un contrato:</strong> El tratamiento es necesario
          para prestarte los servicios de WalletWise que has solicitado al
          registrarte.
        </li>
        <li>
          <strong>Consentimiento:</strong> Has dado tu consentimiento para el
          tratamiento de tus datos personales para los fines especificos
          descritos en esta politica.
        </li>
        <li>
          <strong>Interes legitimo:</strong> El tratamiento es necesario para
          nuestros intereses legitimos, como mejorar la seguridad y
          funcionalidad de la aplicacion, siempre que estos intereses no
          prevalezcan sobre tus derechos fundamentales.
        </li>
        <li>
          <strong>Obligacion legal:</strong> El tratamiento es necesario para
          cumplir con obligaciones legales a las que estamos sujetos.
        </li>
      </ul>

      <h2>5. Almacenamiento y Seguridad de los Datos</h2>

      <h3>5.1. Encriptacion de extremo a extremo (E2E)</h3>

      <p>
        WalletWise implementa encriptacion de extremo a extremo para proteger
        tus datos financieros sensibles. Esto significa que:
      </p>

      <ul>
        <li>
          Tus datos financieros (cuentas, transacciones, presupuestos, etc.) son
          encriptados en tu dispositivo antes de ser transmitidos a nuestros
          servidores.
        </li>
        <li>
          Solo tu, con tu contrasena maestra, puedes desencriptar y acceder a
          esta informacion.
        </li>
        <li>
          Ni WalletWise ni terceros pueden acceder al contenido desencriptado de
          tus datos financieros.
        </li>
      </ul>

      <p>
        Para mas detalles sobre nuestra implementacion de encriptacion, consulta
        nuestra{" "}
        <a href="/confidentiality">Politica de Confidencialidad y Encriptacion</a>.
      </p>

      <h3>5.2. Medidas de seguridad adicionales</h3>

      <ul>
        <li>Conexiones seguras mediante protocolo HTTPS/TLS.</li>
        <li>Contrasenas almacenadas utilizando algoritmos de hash seguros (bcrypt).</li>
        <li>Autenticacion de dos factores (2FA) opcional para mayor proteccion.</li>
        <li>Soporte para autenticacion biometrica mediante WebAuthn/Passkeys.</li>
        <li>Monitoreo continuo de actividades sospechosas.</li>
        <li>Actualizaciones regulares de seguridad.</li>
      </ul>

      <h3>5.3. Ubicacion de los datos</h3>

      <p>
        Tus datos son almacenados en servidores seguros proporcionados por
        proveedores de infraestructura en la nube de reconocida reputacion. Los
        datos pueden ser almacenados en servidores ubicados fuera de Venezuela,
        en paises que cuentan con niveles adecuados de proteccion de datos
        personales.
      </p>

      <h2>6. Conservacion de los Datos</h2>

      <p>
        Conservamos tus datos personales durante el tiempo que sea necesario
        para cumplir con los fines para los que fueron recopilados:
      </p>

      <ul>
        <li>
          <strong>Datos de cuenta:</strong> Mientras mantengas tu cuenta activa
          en WalletWise.
        </li>
        <li>
          <strong>Datos financieros encriptados:</strong> Mientras mantengas tu
          cuenta activa. Puedes eliminar registros individuales en cualquier
          momento.
        </li>
        <li>
          <strong>Datos de uso y registros tecnicos:</strong> Hasta 12 meses
          desde su recopilacion.
        </li>
        <li>
          <strong>Datos para cumplimiento legal:</strong> Durante el periodo
          requerido por la legislacion aplicable.
        </li>
      </ul>

      <p>
        Cuando elimines tu cuenta, todos tus datos personales seran eliminados
        permanentemente de nuestros sistemas en un plazo maximo de 30 dias,
        excepto aquellos que debamos conservar por obligaciones legales.
      </p>

      <h2>7. Cookies y Tecnologias Similares</h2>

      <p>WalletWise utiliza las siguientes categorias de cookies:</p>

      <h3>7.1. Cookies esenciales</h3>

      <p>
        Son necesarias para el funcionamiento basico de la aplicacion y no
        pueden ser desactivadas. Incluyen:
      </p>

      <ul>
        <li>Cookies de sesion para mantener tu sesion iniciada.</li>
        <li>Cookies de seguridad para proteger contra ataques CSRF.</li>
        <li>Cookies de preferencias tecnicas (tema claro/oscuro).</li>
      </ul>

      <h3>7.2. Cookies analiticas</h3>

      <p>
        Nos ayudan a entender como los usuarios interactuan con la aplicacion.
        Estos datos son anonimizados y no permiten identificarte personalmente.
        Puedes optar por no participar en la recopilacion de datos analiticos
        desde la configuracion de tu cuenta.
      </p>

      <p>
        No utilizamos cookies de publicidad ni compartimos datos de cookies con
        redes publicitarias.
      </p>

      <h2>8. Comparticion de Datos con Terceros</h2>

      <p>
        WalletWise no vende, alquila ni comercializa tus datos personales.
        Podemos compartir informacion limitada con terceros unicamente en las
        siguientes circunstancias:
      </p>

      <h3>8.1. Proveedores de servicios</h3>

      <ul>
        <li>
          <strong>Proveedores de infraestructura:</strong> Servicios de
          alojamiento y bases de datos en la nube que almacenan tus datos
          encriptados.
        </li>
        <li>
          <strong>Proveedores de autenticacion:</strong> Si decides utilizar
          inicio de sesion con Google u otros proveedores externos, estos
          recibiran los datos necesarios para autenticarte.
        </li>
      </ul>

      <p>
        Todos nuestros proveedores de servicios estan obligados
        contractualmente a proteger tus datos y utilizarlos unicamente para los
        fines especificados.
      </p>

      <h3>8.2. Requerimientos legales</h3>

      <p>
        Podemos divulgar tus datos personales si es requerido por ley, orden
        judicial, o solicitud de autoridad competente, siempre que:
      </p>

      <ul>
        <li>El requerimiento sea legalmente valido y vinculante.</li>
        <li>
          Te notifiquemos del requerimiento, salvo que la ley nos lo prohiba.
        </li>
        <li>
          Limitemos la divulgacion a la informacion estrictamente necesaria.
        </li>
      </ul>

      <p>
        Es importante destacar que, debido a la encriptacion de extremo a
        extremo, no podemos proporcionar el contenido desencriptado de tus datos
        financieros incluso si se nos requiriera legalmente, ya que no tenemos
        acceso a las claves de encriptacion.
      </p>

      <h3>8.3. Transferencias comerciales</h3>

      <p>
        En caso de fusion, adquisicion o venta de activos, tus datos personales
        podrian ser transferidos como parte de la transaccion. Te notificaremos
        de cualquier cambio en la titularidad o uso de tus datos personales.
      </p>

      <h2>9. Tus Derechos</h2>

      <p>
        De acuerdo con la legislacion venezolana aplicable, tienes los
        siguientes derechos sobre tus datos personales:
      </p>

      <ul>
        <li>
          <strong>Derecho de acceso:</strong> Puedes solicitar informacion sobre
          los datos personales que tenemos sobre ti y obtener una copia de los
          mismos.
        </li>
        <li>
          <strong>Derecho de rectificacion:</strong> Puedes corregir datos
          inexactos o incompletos directamente desde tu perfil de usuario o
          solicitandonos la correccion.
        </li>
        <li>
          <strong>Derecho de supresion:</strong> Puedes solicitar la eliminacion
          de tus datos personales. Tambien puedes eliminar tu cuenta completa en
          cualquier momento.
        </li>
        <li>
          <strong>Derecho a la portabilidad:</strong> Puedes exportar todos tus
          datos en un formato estructurado y de uso comun (JSON) desde la
          configuracion de tu cuenta.
        </li>
        <li>
          <strong>Derecho de oposicion:</strong> Puedes oponerte al tratamiento
          de tus datos para fines especificos, como el analisis de uso.
        </li>
        <li>
          <strong>Derecho a retirar el consentimiento:</strong> Puedes retirar
          tu consentimiento en cualquier momento, sin que ello afecte la
          licitud del tratamiento basado en el consentimiento previo a su
          retiro.
        </li>
      </ul>

      <p>
        Para ejercer cualquiera de estos derechos, puedes utilizar las opciones
        disponibles en la configuracion de tu cuenta o contactarnos
        directamente.
      </p>

      <h2>10. Privacidad de Menores</h2>

      <p>
        WalletWise no esta dirigido a menores de 18 años. No recopilamos
        intencionalmente datos personales de menores de edad. Si eres padre,
        madre o tutor legal y descubres que tu hijo menor de edad nos ha
        proporcionado datos personales, contactanos inmediatamente para que
        procedamos a eliminarlos.
      </p>

      <h2>11. Cambios a esta Politica</h2>

      <p>
        Podemos actualizar esta Politica de Privacidad periodicamente para
        reflejar cambios en nuestras practicas, tecnologias, requisitos legales
        o por otras razones operativas. Cuando realicemos cambios
        significativos:
      </p>

      <ul>
        <li>
          Publicaremos la politica actualizada en esta pagina con una nueva
          fecha de &quot;ultima actualizacion&quot;.
        </li>
        <li>
          Te notificaremos a traves de la aplicacion o por correo electronico si
          los cambios son sustanciales.
        </li>
        <li>
          Para cambios materiales que afecten el tratamiento de tus datos,
          solicitaremos tu consentimiento cuando sea legalmente requerido.
        </li>
      </ul>

      <p>
        Te recomendamos revisar esta politica periodicamente para mantenerte
        informado sobre como protegemos tu informacion.
      </p>

      <h2>12. Legislacion Aplicable</h2>

      <p>
        Esta Politica de Privacidad se rige por las leyes de la Republica
        Bolivariana de Venezuela, incluyendo pero no limitado a:
      </p>

      <ul>
        <li>
          Constitucion de la Republica Bolivariana de Venezuela (Articulos 28,
          48 y 60 sobre proteccion de datos personales y privacidad).
        </li>
        <li>
          Ley Especial contra los Delitos Informaticos (Gaceta Oficial N° 37.313
          del 30 de octubre de 2001).
        </li>
        <li>
          Ley de Infogobierno (Gaceta Oficial N° 40.274 del 17 de octubre de
          2013).
        </li>
        <li>Cualquier otra normativa aplicable en materia de proteccion de datos.</li>
      </ul>

      <h2>13. Contacto</h2>

      <p>
        Si tienes preguntas, comentarios o solicitudes relacionadas con esta
        Politica de Privacidad o el tratamiento de tus datos personales, puedes
        contactarnos a traves de:
      </p>

      <ul>
        <li>
          <strong>Correo electronico:</strong> [CORREO_CONTACTO]
        </li>
        <li>
          <strong>Formulario de contacto:</strong> Disponible en la seccion de
          ayuda de la aplicacion.
        </li>
      </ul>

      <p>
        Nos comprometemos a responder a tus solicitudes en un plazo razonable,
        no mayor a 15 dias habiles.
      </p>

      <hr />

      <p className="text-sm text-muted-foreground">
        Al utilizar WalletWise, confirmas que has leido, entendido y aceptado
        esta Politica de Privacidad.
      </p>
    </>
  );
}
