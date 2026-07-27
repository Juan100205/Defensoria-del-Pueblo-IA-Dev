import { FUNCIONARIOS } from '../../data/constants';

export function UsuariosView() {
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
          <select className="sel">
            <option>Todas las dependencias</option>
            <option>Delegada para la Salud</option>
            <option>Regional Antioquia</option>
          </select>
          <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
            <span style={{ marginRight: 6 }}>+</span> Crear usuario
          </button>
        </div>
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Funcionario</th><th>Rol</th><th>Dependencia</th><th>Permisos</th><th>Casos activos</th><th>Último ingreso</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {FUNCIONARIOS.map((f, i) => {
                const ini = f.n.split(' ').map((x) => x[0]).slice(0, 2).join('');
                return (
                  <tr key={f.n}>
                    <td>
                      <div className="row gap12">
                        <span className="uav" style={{ background: `${col[i]}22`, color: col[i], width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: '0 0 auto' }}>{ini}</span>
                        <div>
                          <b style={{ fontWeight: 600 }}>{f.n}</b>
                          <div className="tiny muted">{f.n.split(' ')[0].toLowerCase()}.{f.n.split(' ')[1].toLowerCase()}@defensoria.gov.co</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge ${f.r === 'Administrador' ? 'b-red' : f.r === 'Coordinadora' ? 'b-navy' : f.r === 'Analista' ? 'b-gold' : 'b-grey'}`}>{f.r}</span></td>
                    <td>{f.d}</td>
                    <td><div className="perm">{f.p.map((p) => <span key={p} className="badge b-grey">{p}</span>)}</div></td>
                    <td className="num">{f.c}</td>
                    <td className="tiny muted">{f.l}</td>
                    <td><span className={`switch ${f.a ? 'on' : ''}`} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
