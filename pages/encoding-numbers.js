import Layout from '../components/Layout'
import SimpleScalarEncoder from '../components/diagrams/SimpleScalarEncoder'

export default function EncodingNumbers() {
  return (
    <div>
      <Layout>
        
        <SimpleScalarEncoder 
          id="sse"
          min={0} 
          max={55}
          val={27.5}
          bits={50}
          width={500}
        />

      </Layout>
    </div>
  )
}
