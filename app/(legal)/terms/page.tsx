import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terminos y Condiciones | WalletWise",
  description:
    "Terminos y condiciones de uso de WalletWise. Conoce tus derechos y responsabilidades al utilizar nuestra plataforma.",
};

export default function TermsPage() {
  return (
    <>
      <h1>Terminos y Condiciones de Uso</h1>

      <p className="lead">
        Ultima actualizacion: {new Date().toLocaleDateString("es-VE")}
      </p>

      <p>
        Bienvenido a WalletWise. Estos Terminos y Condiciones de Uso (en
        adelante, los &quot;Terminos&quot;) regulan el acceso y uso de la
        aplicacion web WalletWise (en adelante, el &quot;Servicio&quot; o la
        &quot;Aplicacion&quot;), incluyendo todas sus funcionalidades,
        contenidos y servicios relacionados.
      </p>

      <p>
        Al registrarte, acceder o utilizar WalletWise, aceptas estar legalmente
        vinculado por estos Terminos. Si no estas de acuerdo con alguna parte de
        estos Terminos, no debes utilizar el Servicio.
      </p>

      <h2>1. Descripcion del Servicio</h2>

      <p>
        WalletWise es una aplicacion de gestion financiera personal que permite
        a los usuarios:
      </p>

      <ul>
        <li>
          Registrar y gestionar cuentas financieras personales en multiples
          monedas (USD, VES, COP, USDT, entre otras).
        </li>
        <li>
          Registrar ingresos, gastos y transferencias entre cuentas.
        </li>
        <li>
          Crear y monitorear presupuestos personalizados.
        </li>
        <li>
          Gestionar inventario personal con seguimiento de precios.
        </li>
        <li>
          Visualizar estadisticas y reportes sobre su situacion financiera.
        </li>
        <li>
          Acceder a tasas de cambio actualizadas desde fuentes oficiales y de
          mercado.
        </li>
      </ul>

      <p>
        El Servicio se proporciona de forma gratuita y no incluye planes de
        pago, suscripciones ni funcionalidades premium.
      </p>

      <h2>2. Elegibilidad y Registro</h2>

      <h3>2.1. Requisitos de edad</h3>

      <p>
        Para utilizar WalletWise, debes tener al menos 18 años de edad o la
        mayoria de edad legal en tu jurisdiccion, la que sea mayor. Al
        registrarte, declaras y garantizas que cumples con este requisito.
      </p>

      <h3>2.2. Registro de cuenta</h3>

      <p>Para acceder a las funcionalidades de WalletWise, debes:</p>

      <ul>
        <li>
          Crear una cuenta proporcionando una direccion de correo electronico
          valida y una contrasena segura.
        </li>
        <li>
          Proporcionar informacion veraz, precisa y actualizada durante el
          proceso de registro.
        </li>
        <li>
          Mantener la confidencialidad de tus credenciales de acceso.
        </li>
      </ul>

      <h3>2.3. Una cuenta por usuario</h3>

      <p>
        Cada usuario puede mantener unicamente una cuenta activa. Nos reservamos
        el derecho de suspender o eliminar cuentas duplicadas o creadas con
        informacion falsa.
      </p>

      <h2>3. Seguridad de la Cuenta</h2>

      <h3>3.1. Responsabilidad del usuario</h3>

      <p>Eres el unico responsable de:</p>

      <ul>
        <li>
          Mantener la confidencialidad de tu contrasena y cualquier otro
          mecanismo de autenticacion (codigos 2FA, dispositivos biometricos,
          etc.).
        </li>
        <li>
          Todas las actividades que ocurran bajo tu cuenta, ya sean autorizadas
          o no.
        </li>
        <li>
          Notificarnos inmediatamente si sospechas de cualquier uso no
          autorizado de tu cuenta o cualquier otra brecha de seguridad.
        </li>
      </ul>

      <h3>3.2. Medidas de seguridad opcionales</h3>

      <p>
        WalletWise ofrece opciones de seguridad adicionales que te recomendamos
        activar:
      </p>

      <ul>
        <li>
          <strong>Autenticacion de dos factores (2FA):</strong> Agrega una capa
          adicional de seguridad mediante codigos temporales.
        </li>
        <li>
          <strong>Autenticacion biometrica (Passkeys):</strong> Utiliza tu
          huella dactilar, reconocimiento facial u otros metodos biometricos
          para acceder a tu cuenta.
        </li>
      </ul>

      <h3>3.3. Recuperacion de cuenta</h3>

      <p>
        Si pierdes acceso a tu cuenta, podemos proporcionarte mecanismos de
        recuperacion. Sin embargo, debido a la encriptacion de extremo a extremo
        de tus datos financieros, si pierdes tu contrasena maestra y no tienes
        configurados metodos de recuperacion alternativos, podria ser imposible
        recuperar tus datos encriptados.
      </p>

      <h2>4. Uso Aceptable del Servicio</h2>

      <h3>4.1. Uso permitido</h3>

      <p>
        WalletWise esta disenado exclusivamente para la gestion de finanzas
        personales legitimas. Te comprometes a utilizar el Servicio unicamente
        para:
      </p>

      <ul>
        <li>Gestionar tus propias finanzas personales.</li>
        <li>
          Registrar transacciones, cuentas y presupuestos de manera precisa y
          veraz.
        </li>
        <li>
          Acceder y exportar tus propios datos financieros.
        </li>
      </ul>

      <h3>4.2. Conductas prohibidas</h3>

      <p>
        Al utilizar WalletWise, te comprometes a NO realizar las siguientes
        actividades:
      </p>

      <ul>
        <li>
          <strong>Actividades ilegales:</strong> Utilizar el Servicio para
          cualquier proposito ilegal, incluyendo pero no limitado a lavado de
          dinero, financiamiento de actividades ilicitas, evasion fiscal o
          fraude.
        </li>
        <li>
          <strong>Suplantacion de identidad:</strong> Hacerte pasar por otra
          persona o entidad, o falsificar tu afiliacion con cualquier persona o
          entidad.
        </li>
        <li>
          <strong>Acceso no autorizado:</strong> Intentar acceder a cuentas de
          otros usuarios, sistemas o redes sin autorizacion.
        </li>
        <li>
          <strong>Interferencia con el Servicio:</strong> Interferir o intentar
          interferir con el funcionamiento adecuado del Servicio, incluyendo la
          introduccion de virus, ataques de denegacion de servicio, o cualquier
          otro codigo malicioso.
        </li>
        <li>
          <strong>Ingenieria inversa:</strong> Descompilar, desensamblar,
          realizar ingenieria inversa o intentar descubrir el codigo fuente del
          Servicio, excepto en la medida permitida por la ley aplicable.
        </li>
        <li>
          <strong>Extraccion automatizada:</strong> Utilizar robots, scrapers u
          otros medios automatizados para acceder al Servicio o extraer datos
          sin autorizacion.
        </li>
        <li>
          <strong>Uso comercial no autorizado:</strong> Revender, redistribuir o
          explotar comercialmente el Servicio sin autorizacion expresa.
        </li>
        <li>
          <strong>Abuso de recursos:</strong> Utilizar el Servicio de manera que
          imponga una carga desproporcionada en nuestra infraestructura.
        </li>
      </ul>

      <h2>5. Contenido del Usuario</h2>

      <h3>5.1. Propiedad de los datos</h3>

      <p>
        Todos los datos que ingreses en WalletWise (transacciones, cuentas,
        categorias, presupuestos, etc.) son de tu propiedad exclusiva. WalletWise
        no reclama ningun derecho de propiedad sobre tu contenido.
      </p>

      <h3>5.2. Licencia de uso</h3>

      <p>
        Al utilizar el Servicio, nos otorgas una licencia limitada, no
        exclusiva, para almacenar, procesar y mostrar tu contenido unicamente con
        el fin de proporcionarte el Servicio. Esta licencia termina cuando
        eliminas tu contenido o tu cuenta.
      </p>

      <h3>5.3. Responsabilidad sobre el contenido</h3>

      <p>
        Eres el unico responsable de la precision, legalidad y veracidad de los
        datos que ingresas en WalletWise. Nos reservamos el derecho de eliminar
        contenido que viole estos Terminos.
      </p>

      <h2>6. Propiedad Intelectual</h2>

      <h3>6.1. Derechos de WalletWise</h3>

      <p>
        WalletWise y todo su contenido, caracteristicas y funcionalidades
        (incluyendo pero no limitado a diseno, graficos, texto, logotipos,
        iconos, imagenes, codigo fuente y software) son propiedad de WalletWise
        o sus licenciantes y estan protegidos por las leyes de propiedad
        intelectual de Venezuela y tratados internacionales.
      </p>

      <h3>6.2. Licencia limitada</h3>

      <p>
        Te otorgamos una licencia limitada, no exclusiva, no transferible y
        revocable para acceder y utilizar el Servicio para tus fines personales
        y no comerciales, sujeta al cumplimiento de estos Terminos.
      </p>

      <h3>6.3. Restricciones</h3>

      <p>No puedes:</p>

      <ul>
        <li>
          Copiar, modificar, distribuir, vender o alquilar ninguna parte del
          Servicio.
        </li>
        <li>
          Utilizar las marcas, logotipos o nombres comerciales de WalletWise sin
          autorizacion escrita.
        </li>
        <li>
          Eliminar o alterar avisos de derechos de autor u otros avisos de
          propiedad.
        </li>
      </ul>

      <h2>7. Servicios de Terceros</h2>

      <h3>7.1. Integraciones</h3>

      <p>
        WalletWise puede integrarse con servicios de terceros, como proveedores
        de autenticacion (Google) y fuentes de tasas de cambio. El uso de estos
        servicios esta sujeto a sus propios terminos y politicas de privacidad.
      </p>

      <h3>7.2. Tasas de cambio</h3>

      <p>
        Las tasas de cambio mostradas en WalletWise se obtienen de fuentes
        externas (Banco Central de Venezuela, servicios de mercado paralelo,
        exchanges de criptomonedas). Estas tasas se proporcionan unicamente con
        fines informativos y pueden no reflejar las tasas reales de transaccion.
        WalletWise no garantiza la precision, actualizacion o disponibilidad de
        estas tasas.
      </p>

      <h3>7.3. Sin responsabilidad por terceros</h3>

      <p>
        No somos responsables de los servicios, contenidos, politicas o
        practicas de terceros. Tu uso de servicios de terceros es bajo tu propio
        riesgo.
      </p>

      <h2>8. Exencion de Responsabilidad - No Constituye Asesoria Financiera</h2>

      <p className="font-bold bg-muted p-4 rounded-lg">
        IMPORTANTE: WalletWise es una herramienta de registro y seguimiento
        financiero personal. El Servicio NO proporciona, ni debe interpretarse
        como, asesoria financiera, fiscal, legal, contable o de inversion de
        ningun tipo.
      </p>

      <ul>
        <li>
          La informacion mostrada en WalletWise (incluyendo estadisticas,
          graficos, proyecciones y tasas de cambio) se proporciona unicamente
          con fines informativos y de organizacion personal.
        </li>
        <li>
          No debes tomar decisiones financieras basandote unicamente en la
          informacion proporcionada por WalletWise.
        </li>
        <li>
          Para decisiones financieras importantes, te recomendamos consultar con
          profesionales calificados (contadores, asesores financieros,
          abogados).
        </li>
        <li>
          WalletWise no es una institucion financiera, no esta regulada como
          tal, y no ofrece servicios bancarios, de inversion, credito o seguros.
        </li>
      </ul>

      <h2>9. Disponibilidad y Modificaciones del Servicio</h2>

      <h3>9.1. Disponibilidad</h3>

      <p>
        Nos esforzamos por mantener WalletWise disponible las 24 horas del dia,
        los 7 dias de la semana. Sin embargo, no garantizamos que el Servicio
        estara disponible de forma ininterrumpida o libre de errores. El Servicio
        puede estar temporalmente no disponible debido a:
      </p>

      <ul>
        <li>Mantenimiento programado o de emergencia.</li>
        <li>Actualizaciones del sistema.</li>
        <li>Problemas tecnicos fuera de nuestro control.</li>
        <li>Fuerza mayor.</li>
      </ul>

      <h3>9.2. Modificaciones</h3>

      <p>
        Nos reservamos el derecho de modificar, suspender o discontinuar
        cualquier aspecto del Servicio en cualquier momento, con o sin previo
        aviso. No seremos responsables ante ti ni ante terceros por cualquier
        modificacion, suspension o discontinuacion del Servicio.
      </p>

      <h3>9.3. Notificacion de cambios</h3>

      <p>
        Para cambios significativos que afecten la funcionalidad principal del
        Servicio, haremos esfuerzos razonables para notificarte con anticipacion
        a traves de la aplicacion o por correo electronico.
      </p>

      <h2>10. Limitacion de Responsabilidad</h2>

      <p>
        EN LA MAXIMA MEDIDA PERMITIDA POR LA LEY APLICABLE:
      </p>

      <h3>10.1. Exclusion de garantias</h3>

      <p>
        EL SERVICIO SE PROPORCIONA &quot;TAL CUAL&quot; Y &quot;SEGUN
        DISPONIBILIDAD&quot;, SIN GARANTIAS DE NINGUN TIPO, YA SEAN EXPRESAS O
        IMPLICITAS, INCLUYENDO PERO NO LIMITADO A GARANTIAS DE
        COMERCIABILIDAD, IDONEIDAD PARA UN PROPOSITO PARTICULAR, NO INFRACCION
        O FUNCIONAMIENTO ININTERRUMPIDO.
      </p>

      <h3>10.2. Limitacion de danos</h3>

      <p>
        EN NINGUN CASO WALLETWISE, SUS DIRECTORES, EMPLEADOS, SOCIOS, AGENTES,
        PROVEEDORES O AFILIADOS SERAN RESPONSABLES POR:
      </p>

      <ul>
        <li>
          Danos indirectos, incidentales, especiales, consecuentes o punitivos.
        </li>
        <li>
          Perdida de beneficios, datos, uso, fondo de comercio u otras perdidas
          intangibles.
        </li>
        <li>
          Danos resultantes de: (i) tu acceso o uso del Servicio; (ii) cualquier
          conducta o contenido de terceros; (iii) cualquier contenido obtenido
          del Servicio; (iv) acceso no autorizado, uso o alteracion de tus
          transmisiones o contenido.
        </li>
      </ul>

      <h3>10.3. Tope de responsabilidad</h3>

      <p>
        Dado que el Servicio se proporciona de forma gratuita, nuestra
        responsabilidad total ante ti por cualquier reclamo relacionado con
        estos Terminos o el Servicio no excedera la cantidad de CERO BOLIVARES
        (Bs. 0,00).
      </p>

      <h2>11. Indemnizacion</h2>

      <p>
        Aceptas defender, indemnizar y mantener indemne a WalletWise, sus
        directores, empleados, agentes y afiliados de y contra cualquier
        reclamo, dano, obligacion, perdida, responsabilidad, costo o deuda, y
        gasto (incluyendo honorarios razonables de abogados) que surjan de:
      </p>

      <ul>
        <li>Tu uso del Servicio.</li>
        <li>Tu violacion de estos Terminos.</li>
        <li>
          Tu violacion de cualquier derecho de terceros, incluyendo derechos de
          propiedad intelectual.
        </li>
        <li>
          Cualquier contenido que envies o transmitas a traves del Servicio.
        </li>
      </ul>

      <h2>12. Terminacion</h2>

      <h3>12.1. Terminacion por el usuario</h3>

      <p>
        Puedes dejar de utilizar el Servicio en cualquier momento. Puedes
        eliminar tu cuenta desde la configuracion de la aplicacion, lo que
        resultara en la eliminacion permanente de todos tus datos.
      </p>

      <h3>12.2. Terminacion por WalletWise</h3>

      <p>
        Nos reservamos el derecho de suspender o terminar tu acceso al Servicio,
        con o sin causa y con o sin previo aviso, en cualquier momento,
        incluyendo pero no limitado a si:
      </p>

      <ul>
        <li>Violas estos Terminos.</li>
        <li>
          Tu uso del Servicio representa un riesgo de seguridad para el
          Servicio, otros usuarios o terceros.
        </li>
        <li>Es requerido por ley o autoridad competente.</li>
        <li>El Servicio es discontinuado.</li>
      </ul>

      <h3>12.3. Efectos de la terminacion</h3>

      <p>Tras la terminacion de tu cuenta:</p>

      <ul>
        <li>Perderas acceso al Servicio y a todos tus datos.</li>
        <li>
          Tus datos seran eliminados de acuerdo con nuestra Politica de
          Privacidad.
        </li>
        <li>
          Las disposiciones de estos Terminos que por su naturaleza deban
          sobrevivir (limitacion de responsabilidad, indemnizacion, ley
          aplicable) permanenceran vigentes.
        </li>
      </ul>

      <h3>12.4. Exportacion de datos</h3>

      <p>
        Antes de eliminar tu cuenta, te recomendamos exportar tus datos
        utilizando la funcion de exportacion disponible en la configuracion de
        la aplicacion.
      </p>

      <h2>13. Ley Aplicable y Resolucion de Disputas</h2>

      <h3>13.1. Ley aplicable</h3>

      <p>
        Estos Terminos se regiran e interpretaran de acuerdo con las leyes de la
        Republica Bolivariana de Venezuela, sin consideracion a sus conflictos
        de disposiciones legales.
      </p>

      <h3>13.2. Resolucion de disputas</h3>

      <p>
        Cualquier disputa, controversia o reclamo que surja de o en relacion con
        estos Terminos o el Servicio se resolvera de la siguiente manera:
      </p>

      <ol>
        <li>
          <strong>Negociacion directa:</strong> Las partes intentaran resolver
          cualquier disputa de buena fe mediante negociacion directa durante un
          periodo de 30 dias.
        </li>
        <li>
          <strong>Mediacion:</strong> Si la negociacion directa no resuelve la
          disputa, las partes podran someterse voluntariamente a mediacion.
        </li>
        <li>
          <strong>Jurisdiccion:</strong> Si los metodos anteriores no resuelven
          la disputa, las partes se someten a la jurisdiccion exclusiva de los
          tribunales competentes de la ciudad de Caracas, Republica Bolivariana
          de Venezuela.
        </li>
      </ol>

      <h3>13.3. Renuncia a acciones colectivas</h3>

      <p>
        Aceptas que cualquier disputa sera conducida unicamente de forma
        individual y no como parte de una accion colectiva, consolidada o
        representativa.
      </p>

      <h2>14. Disposiciones Generales</h2>

      <h3>14.1. Acuerdo completo</h3>

      <p>
        Estos Terminos, junto con la Politica de Privacidad y la Politica de
        Confidencialidad y Encriptacion, constituyen el acuerdo completo entre tu
        y WalletWise respecto al uso del Servicio, y reemplazan cualquier acuerdo
        previo.
      </p>

      <h3>14.2. Divisibilidad</h3>

      <p>
        Si alguna disposicion de estos Terminos es considerada invalida,
        ilegal o inaplicable por un tribunal competente, dicha disposicion sera
        modificada y interpretada para lograr los objetivos de dicha disposicion
        en la mayor medida posible, y las disposiciones restantes continuaran en
        pleno vigor y efecto.
      </p>

      <h3>14.3. Renuncia</h3>

      <p>
        La falta de WalletWise de ejercer o hacer cumplir cualquier derecho o
        disposicion de estos Terminos no constituira una renuncia a dicho
        derecho o disposicion. Cualquier renuncia debe ser por escrito y firmada
        por WalletWise.
      </p>

      <h3>14.4. Cesion</h3>

      <p>
        No puedes ceder ni transferir estos Terminos ni tus derechos bajo estos
        Terminos sin el consentimiento previo por escrito de WalletWise.
        WalletWise puede ceder estos Terminos sin restriccion.
      </p>

      <h3>14.5. Notificaciones</h3>

      <p>
        Las notificaciones que te enviemos seran efectivas cuando se publiquen
        en la aplicacion o se envien a la direccion de correo electronico
        asociada a tu cuenta. Las notificaciones que nos envies seran efectivas
        cuando las recibamos en los canales de contacto indicados.
      </p>

      <h2>15. Cambios a estos Terminos</h2>

      <p>
        Nos reservamos el derecho de modificar estos Terminos en cualquier
        momento. Cuando realicemos cambios:
      </p>

      <ul>
        <li>
          Publicaremos los Terminos actualizados en esta pagina con una nueva
          fecha de &quot;ultima actualizacion&quot;.
        </li>
        <li>
          Para cambios materiales, te notificaremos a traves de la aplicacion o
          por correo electronico con al menos 15 dias de anticipacion.
        </li>
        <li>
          Tu uso continuado del Servicio despues de la entrada en vigor de los
          cambios constituira tu aceptacion de los nuevos Terminos.
        </li>
        <li>
          Si no estas de acuerdo con los nuevos Terminos, debes dejar de
          utilizar el Servicio y eliminar tu cuenta.
        </li>
      </ul>

      <h2>16. Contacto</h2>

      <p>
        Si tienes preguntas o comentarios sobre estos Terminos y Condiciones,
        puedes contactarnos a traves de:
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

      <hr />

      <p className="text-sm text-muted-foreground">
        Al crear una cuenta o utilizar WalletWise, confirmas que has leido,
        entendido y aceptado estos Terminos y Condiciones de Uso.
      </p>
    </>
  );
}
