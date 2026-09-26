# Problem Brief — CertiBlock: verificación de certificados digitales

## El problema

Las personas y las organizaciones no pueden comprobar de manera rápida, independiente y confiable si un certificado digital es auténtico, está vigente y no ha sido modificado.

## ¿Quién lo sufre?

Lo sufren principalmente los estudiantes, profesionales y trabajadores que necesitan presentar certificados académicos, laborales o de formación para demostrar sus conocimientos y experiencia. Aunque tengan un certificado legítimo, dependen de que la institución emisora responda y confirme su autenticidad.

También lo sufren las empresas, universidades y entidades que reciben estos documentos, porque deben determinar si fueron realmente emitidos por la institución indicada, si la información fue alterada o si el certificado continúa vigente.

Las instituciones emisoras también se ven afectadas, ya que reciben solicitudes de validación por correo, llamadas u otros canales y deben destinar personal y tiempo para buscar registros y responderlas.

## ¿Cómo se resuelve hoy y qué cuesta?

Actualmente, los certificados suelen compartirse como documentos PDF, imágenes, copias físicas o enlaces proporcionados por la institución emisora.

Para verificar su autenticidad, las empresas o entidades receptoras pueden:

- Comunicarse directamente con la institución.
- Enviar correos o realizar llamadas.
- Consultar bases de datos o portales institucionales.
- Revisar firmas, sellos y códigos internos.
- Solicitar copias autenticadas o documentos adicionales.

Este proceso puede tomar horas o varios días y requiere esfuerzo tanto de quien presenta el certificado como de quien lo verifica y de la institución que debe responder.

Además, cada institución maneja su propio sistema y no existe necesariamente un mecanismo común de verificación. Si la institución deja de operar, cambia su plataforma o no responde, la comprobación se vuelve más difícil.

Los documentos digitales también pueden ser modificados mediante herramientas de edición. Una persona puede alterar un nombre, una fecha, una calificación o la información de un curso sin que el cambio sea fácil de identificar visualmente.

## ¿Por qué creo que blockchain podría aportar?

Mi hipótesis es que blockchain podría aportar una capa compartida de trazabilidad y verificación para los certificados digitales.

Cuando una institución emite un certificado, el sistema podría generar una huella digital única del documento, conocida como **hash**, y registrarla junto con la identidad de la institución emisora, la fecha de emisión y el estado del certificado.

Posteriormente, una empresa, universidad o entidad podría cargar el documento o escanear su código QR. El sistema calcularía nuevamente su hash y lo compararía con el registro original. Si el documento fue modificado, su huella digital sería diferente y la validación no coincidiría.

Blockchain podría aportar principalmente porque:

- Varias instituciones y organizaciones que no necesariamente confían entre sí podrían consultar un registro compartido.
- Permitiría comprobar cuándo y qué institución registró un certificado.
- Mantendría un historial verificable de emisión, actualización o revocación.
- Una modificación del registro no podría realizarse silenciosamente sin dejar evidencia.
- Reduciría la dependencia de llamadas, correos y validaciones manuales.
- El titular podría compartir su certificado y permitir que cualquier entidad compruebe su autenticidad.

El documento completo y los datos personales del titular no tendrían que almacenarse públicamente. En blockchain se registraría únicamente la huella digital del certificado y la información mínima necesaria para verificarlo.

La propuesta no plantea que blockchain pueda determinar si la información emitida por una institución es verdadera. La institución continúa siendo responsable de validar los datos antes de emitir el certificado. Blockchain serviría para **registrar su emisión, comprobar que el documento no fue alterado y mantener trazabilidad sobre su estado**.