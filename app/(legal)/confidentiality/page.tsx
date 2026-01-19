import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de Confidencialidad y Encriptacion | WalletWise",
  description:
    "Conoce como WalletWise protege tus datos financieros mediante encriptacion de extremo a extremo (E2E).",
};

export default function ConfidentialityPage() {
  return (
    <>
      <h1>Politica de Confidencialidad y Encriptacion</h1>

      <p className="lead">
        Ultima actualizacion: {new Date().toLocaleDateString("es-VE")}
      </p>

      <p>
        En WalletWise, la privacidad y seguridad de tus datos financieros son
        nuestra maxima prioridad. Esta Politica de Confidencialidad y
        Encriptacion explica en detalle como protegemos tu informacion
        mediante encriptacion de extremo a extremo (E2E) y otras medidas de
        seguridad avanzadas.
      </p>

      <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg my-6">
        <h3 className="mt-0 text-primary">Nuestro Compromiso</h3>
        <p className="mb-0">
          WalletWise esta disenado bajo el principio de &quot;conocimiento
          cero&quot; (zero-knowledge). Esto significa que tus datos financieros
          sensibles son encriptados de manera que <strong>ni siquiera nosotros
          podemos acceder a ellos</strong>. Solo tu, con tu contrasena maestra,
          puedes desencriptar y ver tu informacion.
        </p>
      </div>

      <h2>1. Que es la Encriptacion de Extremo a Extremo (E2E)</h2>

      <p>
        La encriptacion de extremo a extremo es un metodo de proteccion de datos
        donde la informacion se encripta en tu dispositivo (el &quot;extremo&quot;
        del usuario) y permanece encriptada durante su transmision y
        almacenamiento, hasta que tu la desencriptas nuevamente en tu
        dispositivo.
      </p>

      <h3>1.1. Como funciona en WalletWise</h3>

      <ol>
        <li>
          <strong>Generacion de clave:</strong> Cuando creas tu cuenta, se
          genera una clave de encriptacion unica derivada de tu contrasena
          maestra. Esta clave nunca sale de tu dispositivo ni se almacena en
          nuestros servidores.
        </li>
        <li>
          <strong>Encriptacion local:</strong> Antes de enviar cualquier dato
          financiero a nuestros servidores, este se encripta completamente en
          tu navegador o dispositivo utilizando algoritmos de encriptacion de
          grado militar.
        </li>
        <li>
          <strong>Transmision segura:</strong> Los datos encriptados se
          transmiten a traves de conexiones seguras (HTTPS/TLS) hacia nuestros
          servidores.
        </li>
        <li>
          <strong>Almacenamiento encriptado:</strong> Los datos se almacenan en
          nuestros servidores en su forma encriptada. Sin tu clave de
          encriptacion, estos datos son completamente ilegibles.
        </li>
        <li>
          <strong>Desencriptacion local:</strong> Cuando accedes a tus datos,
          estos se descargan encriptados y se desencriptan unicamente en tu
          dispositivo.
        </li>
      </ol>

      <h3>1.2. Algoritmos de encriptacion</h3>

      <p>WalletWise utiliza algoritmos de encriptacion estandar de la industria:</p>

      <ul>
        <li>
          <strong>AES-256-GCM:</strong> Para la encriptacion de datos. AES
          (Advanced Encryption Standard) con claves de 256 bits es el estandar
          utilizado por gobiernos y entidades financieras a nivel mundial.
        </li>
        <li>
          <strong>PBKDF2:</strong> Para la derivacion de claves a partir de tu
          contrasena maestra, con un alto numero de iteraciones para resistir
          ataques de fuerza bruta.
        </li>
        <li>
          <strong>SHA-256:</strong> Para funciones de hash y verificacion de
          integridad.
        </li>
      </ul>

      <h2>2. Datos Protegidos por Encriptacion E2E</h2>

      <p>
        Los siguientes datos financieros sensibles estan protegidos mediante
        encriptacion de extremo a extremo:
      </p>

      <h3>2.1. Datos encriptados (WalletWise NO puede ver)</h3>

      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Datos Encriptados</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cuentas</td>
            <td>Nombre de la cuenta, saldo actual</td>
          </tr>
          <tr>
            <td>Ingresos</td>
            <td>Descripcion, monto, tasa de cambio personalizada</td>
          </tr>
          <tr>
            <td>Gastos</td>
            <td>Descripcion, monto, tasa de cambio personalizada</td>
          </tr>
          <tr>
            <td>Transferencias</td>
            <td>Descripcion, monto, tasas de cambio</td>
          </tr>
          <tr>
            <td>Presupuestos</td>
            <td>Nombre, descripcion, monto objetivo, monto actual</td>
          </tr>
          <tr>
            <td>Inventario</td>
            <td>Nombre del articulo, notas, precio estimado</td>
          </tr>
          <tr>
            <td>Trabajos</td>
            <td>Nombre, descripcion, monto de pago</td>
          </tr>
          <tr>
            <td>Categorias</td>
            <td>Nombre de la categoria</td>
          </tr>
        </tbody>
      </table>

      <h3>2.2. Metadatos no encriptados (necesarios para el funcionamiento)</h3>

      <p>
        Algunos metadatos se almacenan sin encriptacion E2E para permitir el
        funcionamiento basico del sistema. Estos datos estan protegidos mediante
        encriptacion en transito (HTTPS) y en reposo en nuestros servidores:
      </p>

      <ul>
        <li>
          <strong>Identificadores:</strong> IDs unicos de registros para
          relacionar datos entre si.
        </li>
        <li>
          <strong>Fechas:</strong> Fechas de transacciones y registros para
          permitir ordenamiento y filtrado.
        </li>
        <li>
          <strong>Tipos de moneda:</strong> Codigos de moneda (USD, VES, etc.)
          para conversiones y reportes.
        </li>
        <li>
          <strong>Relaciones:</strong> Referencias entre registros (ej: a que
          cuenta pertenece un gasto).
        </li>
        <li>
          <strong>Datos de cuenta:</strong> Correo electronico, preferencias de
          configuracion, estado de autenticacion.
        </li>
      </ul>

      <h2>3. Tu Contrasena Maestra</h2>

      <p>
        Tu contrasena maestra es la base de toda la seguridad de tus datos en
        WalletWise. Es crucial que entiendas su importancia y responsabilidad.
      </p>

      <h3>3.1. Importancia de la contrasena maestra</h3>

      <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-lg my-6">
        <h4 className="mt-0 text-destructive">Advertencia Critica</h4>
        <p className="mb-0">
          Tu contrasena maestra es la <strong>unica forma</strong> de acceder a
          tus datos encriptados. <strong>WalletWise no puede recuperar,
          restablecer ni acceder a tus datos</strong> si olvidas tu contrasena
          maestra y no tienes configurados metodos de recuperacion alternativos.
          La perdida de tu contrasena maestra puede resultar en la{" "}
          <strong>perdida permanente e irrecuperable</strong> de todos tus
          datos financieros.
        </p>
      </div>

      <h3>3.2. Requisitos de la contrasena maestra</h3>

      <p>
        Para garantizar la maxima seguridad, tu contrasena maestra debe cumplir
        con los siguientes requisitos minimos:
      </p>

      <ul>
        <li>Minimo 12 caracteres de longitud.</li>
        <li>
          Combinacion de letras mayusculas, minusculas, numeros y caracteres
          especiales.
        </li>
        <li>No debe ser una palabra comun del diccionario.</li>
        <li>
          No debe contener informacion personal facilmente identificable
          (nombre, fecha de nacimiento, etc.).
        </li>
        <li>Debe ser unica y no reutilizada en otros servicios.</li>
      </ul>

      <h3>3.3. Recomendaciones de seguridad</h3>

      <ul>
        <li>
          <strong>Utiliza un gestor de contrasenas:</strong> Herramientas como
          Bitwarden, 1Password o el gestor de tu navegador pueden generar y
          almacenar contrasenas seguras.
        </li>
        <li>
          <strong>Considera una frase de contrasena:</strong> Una frase larga y
          memorable puede ser mas segura y facil de recordar que una contrasena
          corta y compleja.
        </li>
        <li>
          <strong>Nunca compartas tu contrasena:</strong> Ni siquiera con
          soporte de WalletWise. Nuestro equipo nunca te pedira tu contrasena.
        </li>
        <li>
          <strong>Cambia tu contrasena periodicamente:</strong> Si sospechas que
          tu contrasena ha sido comprometida, cambiala inmediatamente.
        </li>
      </ul>

      <h2>4. Metodos de Recuperacion de Cuenta</h2>

      <p>
        Entendemos que olvidar una contrasena es humano. Por eso, WalletWise
        ofrece varios metodos de recuperacion que te permiten recuperar el
        acceso a tus datos sin comprometer la seguridad.
      </p>

      <h3>4.1. Autenticacion biometrica (WebAuthn/Passkeys)</h3>

      <p>
        Si configuras autenticacion biometrica, tu clave de encriptacion se
        almacena de forma segura protegida por tu biometria (huella dactilar,
        reconocimiento facial). Esto te permite:
      </p>

      <ul>
        <li>Acceder a tus datos incluso si olvidas tu contrasena maestra.</li>
        <li>Iniciar sesion de forma rapida y segura.</li>
        <li>Cambiar tu contrasena maestra sin perder acceso a tus datos.</li>
      </ul>

      <h3>4.2. Autenticacion de dos factores (2FA/TOTP)</h3>

      <p>
        Si configuras 2FA con una aplicacion de autenticacion (como Google
        Authenticator), puedes utilizar tus codigos de recuperacion para
        verificar tu identidad y recuperar acceso a tu cuenta.
      </p>

      <h3>4.3. Clave de recuperacion</h3>

      <p>
        Al crear tu cuenta, se genera una clave de recuperacion unica. Te
        recomendamos:
      </p>

      <ul>
        <li>Guardarla en un lugar seguro y offline (papel, caja fuerte).</li>
        <li>No almacenarla digitalmente junto con tu contrasena.</li>
        <li>
          Usarla unicamente como ultimo recurso si todos los demas metodos
          fallan.
        </li>
      </ul>

      <h2>5. Lo que WalletWise NO Puede Ver ni Hacer</h2>

      <p>
        Gracias a la encriptacion de extremo a extremo, existen limitaciones
        estrictas sobre lo que WalletWise puede hacer con tus datos:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="text-destructive mt-0">NO Podemos</h4>
          <ul className="mb-0">
            <li>Ver tus balances reales</li>
            <li>Leer los nombres de tus cuentas</li>
            <li>Ver detalles de tus transacciones</li>
            <li>Conocer tus montos de ingresos o gastos</li>
            <li>Leer los nombres de tus presupuestos</li>
            <li>Acceder a tu inventario o su valor</li>
            <li>Recuperar tus datos si pierdes tu contrasena</li>
            <li>Compartir tus datos financieros con terceros</li>
          </ul>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="text-success mt-0">SI Podemos</h4>
          <ul className="mb-0">
            <li>Almacenar tus datos encriptados de forma segura</li>
            <li>Sincronizar tus datos entre dispositivos</li>
            <li>Enviar datos encriptados a tu navegador</li>
            <li>Ver metadatos como fechas y tipos de moneda</li>
            <li>Gestionar tu cuenta (email, sesiones)</li>
            <li>Proporcionar tasas de cambio</li>
            <li>Ayudarte a recuperar acceso si tienes metodos de recuperacion configurados</li>
          </ul>
        </div>
      </div>

      <h2>6. Seguridad Adicional</h2>

      <h3>6.1. Encriptacion en transito</h3>

      <p>
        Todas las comunicaciones entre tu dispositivo y nuestros servidores
        estan protegidas mediante TLS 1.3 (Transport Layer Security), el
        protocolo de seguridad mas reciente y seguro disponible.
      </p>

      <h3>6.2. Encriptacion en reposo</h3>

      <p>
        Ademas de la encriptacion E2E, los datos almacenados en nuestros
        servidores estan protegidos por encriptacion a nivel de base de datos,
        proporcionando una capa adicional de seguridad.
      </p>

      <h3>6.3. Infraestructura segura</h3>

      <ul>
        <li>
          Servidores alojados en proveedores de nube con certificaciones de
          seguridad (SOC 2, ISO 27001).
        </li>
        <li>Acceso restringido a la infraestructura mediante autenticacion multifactor.</li>
        <li>Monitoreo continuo de seguridad y deteccion de intrusos.</li>
        <li>Copias de seguridad encriptadas y geograficamente distribuidas.</li>
        <li>Actualizaciones de seguridad aplicadas de forma regular.</li>
      </ul>

      <h3>6.4. Proteccion contra ataques comunes</h3>

      <ul>
        <li>
          <strong>Proteccion CSRF:</strong> Tokens de seguridad para prevenir
          ataques de falsificacion de solicitudes.
        </li>
        <li>
          <strong>Headers de seguridad:</strong> Configuraciones HTTP estrictas
          para prevenir ataques XSS, clickjacking y otros.
        </li>
        <li>
          <strong>Rate limiting:</strong> Limitacion de intentos de inicio de
          sesion para prevenir ataques de fuerza bruta.
        </li>
        <li>
          <strong>Validacion de entrada:</strong> Todas las entradas de usuario
          son validadas y sanitizadas.
        </li>
      </ul>

      <h2>7. Tus Responsabilidades de Seguridad</h2>

      <p>
        La seguridad es una responsabilidad compartida. Mientras nosotros
        protegemos la infraestructura y la encriptacion, tu tienes
        responsabilidades importantes:
      </p>

      <h3>7.1. Protege tu contrasena maestra</h3>

      <ul>
        <li>Usa una contrasena fuerte y unica.</li>
        <li>No la compartas con nadie.</li>
        <li>No la almacenes en lugares inseguros.</li>
        <li>Cambiala si sospechas que ha sido comprometida.</li>
      </ul>

      <h3>7.2. Asegura tus dispositivos</h3>

      <ul>
        <li>Manten tu sistema operativo y navegador actualizados.</li>
        <li>Usa antivirus y firewall.</li>
        <li>Bloquea tu dispositivo cuando no lo uses.</li>
        <li>Evita usar WalletWise en redes WiFi publicas no seguras.</li>
        <li>Cierra sesion cuando uses dispositivos compartidos.</li>
      </ul>

      <h3>7.3. Habilita seguridad adicional</h3>

      <ul>
        <li>Activa la autenticacion de dos factores (2FA).</li>
        <li>Configura autenticacion biometrica si tu dispositivo lo soporta.</li>
        <li>Guarda tu clave de recuperacion en un lugar seguro.</li>
      </ul>

      <h3>7.4. Mantente alerta</h3>

      <ul>
        <li>
          No hagas clic en enlaces sospechosos que afirmen ser de WalletWise.
        </li>
        <li>Verifica que la URL sea correcta antes de ingresar tu contrasena.</li>
        <li>
          WalletWise nunca te pedira tu contrasena maestra por correo o mensaje.
        </li>
        <li>Reporta cualquier actividad sospechosa inmediatamente.</li>
      </ul>

      <h2>8. Respuesta ante Incidentes de Seguridad</h2>

      <h3>8.1. Nuestro compromiso</h3>

      <p>
        En caso de un incidente de seguridad que afecte potencialmente tus datos:
      </p>

      <ul>
        <li>
          Te notificaremos dentro de las 72 horas siguientes a la deteccion del
          incidente.
        </li>
        <li>
          Proporcionaremos informacion clara sobre la naturaleza del incidente y
          los datos potencialmente afectados.
        </li>
        <li>
          Te daremos recomendaciones sobre medidas que puedas tomar para
          protegerte.
        </li>
        <li>
          Cooperaremos con las autoridades competentes segun sea requerido por
          la ley.
        </li>
      </ul>

      <h3>8.2. Limitaciones debido a la encriptacion E2E</h3>

      <p>
        Es importante entender que, debido a la encriptacion de extremo a
        extremo, incluso en caso de una brecha de seguridad en nuestros
        servidores:
      </p>

      <ul>
        <li>
          Tus datos financieros encriptados seguirian siendo ilegibles sin tu
          clave de encriptacion.
        </li>
        <li>
          Un atacante solo podria acceder a datos encriptados que no podria
          desencriptar.
        </li>
        <li>
          Los metadatos no encriptados (fechas, tipos de moneda, relaciones)
          podrian estar expuestos.
        </li>
      </ul>

      <h3>8.3. Reportar vulnerabilidades</h3>

      <p>
        Si descubres una vulnerabilidad de seguridad en WalletWise, te pedimos
        que la reportes de manera responsable a traves de nuestro canal de
        contacto de seguridad. Apreciamos y reconocemos la contribucion de
        investigadores de seguridad que nos ayudan a mantener el Servicio
        seguro.
      </p>

      <h2>9. Exportacion y Portabilidad de Datos</h2>

      <p>
        Creemos firmemente en tu derecho a controlar tus datos. Por eso,
        WalletWise te permite:
      </p>

      <ul>
        <li>
          <strong>Exportar todos tus datos:</strong> Puedes descargar una copia
          completa de todos tus datos en formato JSON en cualquier momento desde
          la configuracion de tu cuenta.
        </li>
        <li>
          <strong>Datos desencriptados:</strong> La exportacion incluye tus
          datos ya desencriptados para que puedas usarlos fuera de WalletWise.
        </li>
        <li>
          <strong>Formato estandar:</strong> El formato JSON es un estandar
          abierto que puede ser importado en otras aplicaciones o procesado con
          herramientas comunes.
        </li>
      </ul>

      <h2>10. Eliminacion de Datos</h2>

      <p>Cuando solicitas la eliminacion de tu cuenta:</p>

      <ul>
        <li>
          Todos tus datos (encriptados y no encriptados) se eliminan
          permanentemente de nuestros servidores.
        </li>
        <li>
          Las copias de seguridad que contengan tus datos se eliminan dentro del
          ciclo normal de rotacion de backups (maximo 30 dias).
        </li>
        <li>
          La eliminacion es irreversible. Te recomendamos exportar tus datos
          antes de eliminar tu cuenta.
        </li>
      </ul>

      <h2>11. Actualizaciones de esta Politica</h2>

      <p>
        Podemos actualizar esta politica periodicamente para reflejar mejoras en
        nuestras practicas de seguridad o cambios en la legislacion. Cuando
        realicemos cambios significativos:
      </p>

      <ul>
        <li>Publicaremos la politica actualizada en esta pagina.</li>
        <li>Actualizaremos la fecha de &quot;ultima actualizacion&quot;.</li>
        <li>
          Para cambios sustanciales, te notificaremos a traves de la aplicacion
          o por correo electronico.
        </li>
      </ul>

      <h2>12. Contacto</h2>

      <p>
        Si tienes preguntas sobre esta politica, nuestras practicas de seguridad,
        o sospechas de un incidente de seguridad, contactanos a traves de:
      </p>

      <ul>
        <li>
          <strong>Correo electronico:</strong> [CORREO_CONTACTO]
        </li>
        <li>
          <strong>Correo de seguridad:</strong> [CORREO_SEGURIDAD]
        </li>
      </ul>

      <hr />

      <p className="text-sm text-muted-foreground">
        Esta politica complementa nuestra{" "}
        <a href="/privacy">Politica de Privacidad</a> y nuestros{" "}
        <a href="/terms">Terminos y Condiciones</a>. Al utilizar WalletWise,
        confirmas que has leido y comprendido todas estas politicas.
      </p>
    </>
  );
}
