import { useState, useEffect } from 'react';
import { getProfiles } from '../../lib/api';
import type { Profile } from '../../contexts/AuthContext';

export function UsuariosView() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfiles()
      .then((data) => { setUsers(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const col = ['#1E3A7B', '#1B7A4C', '#B4232A', '#B08A20', '#4A6BB5', '#6B7684', '#2C4E9B'];

  return (
    <div className="vpane on" id="v-usr">
      <div className="card">
        <div className="toolbar">
          <div className="search" style={{ width: 260 }}>
            <svg width="16" height="16" style={{ color: 'var(--ink-3)' }}><use href="#i-search" /></svg>
            <input className="field" placeholder="Buscar funcionario" />
          </div>
          <select className="sel">
            <option>Todos los roles</option>
            <option>Administrador</option>
            <option>Coordinador</option>
            <option>Analista</option>
            <option>Consulta</option>
          </select>
          <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
            <span style={{ marginRight: 6 }}>+</span> Crear usuario
          </button>
        </div>
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Funcionario</th><th>Rol</th><th>Dependencia</th><th>Estado</th><th>Último ingreso</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 44, color: 'var(--ink-3)' }}>Cargando usuarios...</td></tr>
              ) : users.length > 0 ? users.map((u, i) => {
                const ini = u.full_name.split(' ').map((x) => x[0]).slice(0, 2).join('');
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="row gap12">
                        <span className="uav" style={{ background: `${col[i % col.length]}22`, color: col[i % col.length], width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: '0 0 auto' }}>{ini}</span>
                        <div>
                          <b style={{ fontWeight: 600 }}>{u.full_name}</b>
                          <div className="tiny muted">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge ${u.role === 'administrador' ? 'b-red' : u.role === 'coordinador' ? 'b-navy' : u.role === 'analista' ? 'b-gold' : 'b-grey'}`}>{u.role}</span></td>
                    <td>{u.department || '—'}</td>
                    <td><span className={`switch ${u.is_active ? 'on' : ''}`} /></td>
                    <td className="tiny muted">{new Date(u.created_at).toLocaleDateString('es-CO')}</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 44, color: 'var(--ink-3)' }}>
                  No hay usuarios registrados.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
