import Image from "next/image";
import handGif from "../../public/hand.gif";

export default function Contact() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="text-center flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-16 px-16 sm:items-start">
        <h1 className="font-serif text-6xl mx-auto font-semibold leading-10 tracking-widest text-primary-active md:text-7xl">contacto</h1>
        <Image src={handGif} height={250} unoptimized alt="hand" className="mx-auto" />
        <p className="max-w-md text-lg leading-8 mx-auto text-primary">
          Si quieres hablar, puedes enviarme un mensaje a <a href="https://www.instagram.com/josevitola_/" className="underline!">Instagram</a>,
          un <a href="mailto:josevitolamusic@gmail.com" className="underline!">correo</a>,
          una hoja por paloma mensajera o barco de vapor.
          Próximamente también por pings de <a href="https://es.wikipedia.org/wiki/LoRa" className="underline!">LoRa</a>
          &nbsp;con <a href="https://reticulum.network/" className="underline!">Reticulum</a>!
          <br />
          <br />
          <small className="text-sm tracking-normal leading-0">Si quieres saber de mi trabajo más técnico, puedes ver mi <a href="https://github.com/josevitola" className="underline!">GitHub</a> o,
            si estás muerto por dentro, supongo que puedes ir a mi <a href="https://www.linkedin.com/in/josevitola/" className="underline!">LinkedIn</a>.</small>
        </p>
      </main>
    </div>
  );
}