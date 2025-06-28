import { useState } from 'react';

function UserSelection({ participants, onSelect }) {
  const [selected, setSelected] = useState(participants[0] || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-lg animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-center">Siapa Anda?</h2>
      <p className="text-gray-400 mb-6 text-center">
        Pilih nama Anda agar pesan bisa ditampilkan di sisi kanan.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          {participants.map((name) => (
            <label
              key={name}
              className={`block w-full p-4 rounded-lg cursor-pointer transition-all ${
                selected === name
                  ? 'bg-cyan-500 text-white font-bold ring-2 ring-cyan-300'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <input
                type="radio"
                name="participant"
                value={name}
                checked={selected === name}
                onChange={(e) => setSelected(e.target.value)}
                className="hidden"
              />
              {name}
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
        >
          Lihat Chat
        </button>
      </form>
    </div>
  );
}

export default UserSelection;
