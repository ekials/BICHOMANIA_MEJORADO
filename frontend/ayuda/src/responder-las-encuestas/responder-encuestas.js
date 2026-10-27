import { useEffect, useState } from "react";

export default function ResponderEncuestas() {
    const [encuestas, setEncuestas] = useState([]);
    const [seleccionada, setSeleccionada] = useState(null);
    const [detalles, setDetalles] = useState([]);

    const idCliente = localStorage.getItem("id_usuario");

    useEffect(() => {
        cargarEncuestas();
    }, []);


    const cargarEncuestas = async () => {
        if (!idCliente) {
            setEncuestas([]);
            return;
        }
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/encuestas-activas?id_cliente=${idCliente}`);
            if (!res.ok) throw new Error(await res.text());
            setEncuestas(await res.json());
        } catch (err) {
            console.error("Error al cargar encuestas:", err);
            setEncuestas([]);
        }
    };


    const seleccionarEncuesta = async (encuesta) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/detalles-encuesta/${encuesta.id_encuesta}`);
            if (!res.ok) throw new Error(await res.text());
            setDetalles(await res.json());
            setSeleccionada(encuesta);
        } catch (err) {
            alert(err.message || "No se pudieron cargar las opciones");
        }
    };


    const votar = async (detalle) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/votar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idCliente,
                    idEncuesta: seleccionada.id_encuesta,
                    idDetalle: detalle.id_detalle
                })
            });

            if (!res.ok) {
                alert(await res.text());
                cargarEncuestas();
                setSeleccionada(null);
                return;
            }

            setEncuestas(encuestas.filter(e => e.id_encuesta !== seleccionada.id_encuesta));
            setSeleccionada(null);
            alert("¡Voto registrado!");
        } catch (err) {
            alert("No se pudo registrar el voto. Intenta de nuevo.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Encuestas Disponibles</h2>

            {encuestas.length === 0 && seleccionada === null && (
                <p>No tienes encuestas disponibles para responder.</p>
            )}

            {seleccionada === null ? (
                <ul>
                    {encuestas.map(e => (
                        <li
                            key={e.id_encuesta}
                            style={{
                                marginBottom: "10px",
                                cursor: "pointer",
                                padding: "10px",
                                border: "1px solid #ccc",
                                borderRadius: "6px"
                            }}
                            onClick={() => seleccionarEncuesta(e)}
                        >
                            <strong>{e.descripcion}</strong>
                            <br />
                            <small>{String(e.fecha_inicio).slice(0, 10)} → {String(e.fecha_fin).slice(0, 10)}</small>
                        </li>
                    ))}
                </ul>
            ) : (
                <div>
                    <h3>{seleccionada.descripcion}</h3>

                    <button onClick={() => setSeleccionada(null)}>
                        Volver
                    </button>

                    <ul>
                        {detalles.map(d => (
                            <li
                                key={d.id_detalle}
                                style={{
                                    padding: "12px",
                                    marginTop: "10px",
                                    border: "1px solid #aaa",
                                    borderRadius: "6px",
                                    cursor: "pointer"
                                }}
                                onClick={() => votar(d)}
                            >
                                <strong>{d.opcion_equipo}</strong> – {d.opcion_liga}
                                <br />
                                <small>{d.categoria}</small>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
